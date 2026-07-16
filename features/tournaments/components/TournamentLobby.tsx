"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Spinner } from "@/components/ui/Spinner";
import { formatDistanceToNow } from "date-fns";
import { getSocket } from "@/lib/socket-client";
import { GameView } from "@/features/game";

export function TournamentLobby({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [playingMatch, setPlayingMatch] = useState(false);

  const fetchTournament = async () => {
    try {
      const res = await fetch(`http://localhost:4001/api/tournaments/${tournamentId}`);
      if (!res.ok) throw new Error("Failed to fetch tournament");
      const data = await res.json();
      setTournament(data);
      if (userId) {
        setIsJoined(data.players.some((p: any) => p.userId === userId));
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournament();
    const int = setInterval(fetchTournament, 5000); // Polling for leaderboard updates for now
    return () => clearInterval(int);
  }, [tournamentId, userId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }
    
    const handleRoomJoined = (data: { color: 'w' | 'b', room: string }) => {
      setPlayingMatch(true); // Switches view to GameView
    };

    socket.on('roomJoined', handleRoomJoined);
    
    return () => {
      socket.off('roomJoined', handleRoomJoined);
    };
  }, []);

  const handleJoin = async () => {
    if (!userId) return;
    try {
      await fetch(`http://localhost:4001/api/tournaments/${tournamentId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      fetchTournament();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlay = () => {
    if (!tournament) return;
    const socket = getSocket();
    socket.emit("joinTournamentQueue", { 
      tournamentId, 
      timeControl: tournament.timeControl 
    });
  };

  if (playingMatch) {
    // If playing, render GameView but we need to tell GameView we are in online mode
    return (
      <GameView 
        initialMode="online" 
        onReturnHome={() => {
          setPlayingMatch(false);
          fetchTournament();
          // Leave queue just in case
          getSocket().emit("leaveQueue");
        }} 
      />
    );
  }

  if (loading || !tournament) return <main className="min-h-screen flex items-center justify-center bg-cc-bg-page"><Spinner /></main>;

  return (
    <main className="min-h-screen bg-cc-bg-page p-6 md:p-10 font-sans text-cc-text-primary">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <Card className="p-8 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cc-green opacity-5 blur-[100px] pointer-events-none" />
          
          <div className="flex justify-between items-start z-10">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-extrabold tracking-tight">{tournament.name}</h1>
              <span className="text-cc-text-secondary font-mono text-lg">
                {tournament.type} • {tournament.timeControl}
              </span>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-lg border ${
                tournament.status === 'IN_PROGRESS' ? 'bg-cc-green/20 text-cc-green border-cc-green/30' : 
                tournament.status === 'UPCOMING' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 
                'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {tournament.status.replace('_', ' ')}
              </span>
              {tournament.status === 'UPCOMING' && (
                <span className="text-xs font-semibold text-cc-text-muted mt-2">
                  Starts {formatDistanceToNow(new Date(tournament.startTime), { addSuffix: true })}
                </span>
              )}
              {tournament.status === 'IN_PROGRESS' && (
                <span className="text-xs font-semibold text-cc-text-muted mt-2">
                  Ends {formatDistanceToNow(new Date(tournament.endTime), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 z-10">
            {!isJoined && tournament.status !== 'COMPLETED' && (
              <button 
                onClick={handleJoin}
                className="bg-cc-primary hover:bg-cc-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1"
              >
                Join Tournament
              </button>
            )}
            
            {isJoined && tournament.status === 'IN_PROGRESS' && (
              <button 
                onClick={handlePlay}
                className="bg-cc-green hover:bg-cc-green/90 text-zinc-950 font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(129,182,76,0.3)] hover:shadow-[0_0_30px_rgba(129,182,76,0.5)] hover:-translate-y-1"
              >
                Play Match (Join Queue)
              </button>
            )}
            
            {isJoined && tournament.status === 'UPCOMING' && (
              <span className="text-sm font-semibold text-cc-text-secondary bg-cc-bg-input px-4 py-3 rounded-xl border border-cc-border-light">
                You are joined. Waiting for tournament to start...
              </span>
            )}
          </div>
        </Card>

        {/* Leaderboard */}
        <div className="flex flex-col gap-4 mt-4">
          <SectionHeader>Standings</SectionHeader>
          <Card className="overflow-hidden border border-cc-border">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cc-bg-sidebar border-b border-cc-border-light text-xs font-extrabold uppercase tracking-widest text-cc-text-muted">
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="p-4">Player</th>
                  <th className="p-4 text-center">Streak</th>
                  <th className="p-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {tournament.players.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-cc-text-muted font-medium">
                      No players joined yet.
                    </td>
                  </tr>
                ) : (
                  tournament.players.map((p: any, idx: number) => {
                    const rank = p.rank || idx + 1;
                    const isMe = p.userId === userId;
                    return (
                      <tr key={p.id} className={`border-b border-cc-border-light/50 last:border-0 hover:bg-cc-bg-hover transition-colors ${isMe ? 'bg-cc-bg-sidebar/50' : ''}`}>
                        <td className="p-4 text-center font-bold text-cc-text-secondary">#{rank}</td>
                        <td className="p-4 font-bold flex items-center gap-2">
                          <span className={`${isMe ? 'text-cc-primary' : 'text-cc-text-primary'}`}>{p.user.name}</span>
                          <span className="text-xs font-mono text-cc-text-muted opacity-80">{p.user.rating} Elo</span>
                        </td>
                        <td className="p-4 text-center">
                          {p.streak >= 2 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                              🔥 {p.streak}
                            </span>
                          ) : (
                            <span className="text-cc-text-muted">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right font-extrabold text-lg text-cc-text-primary">{p.score}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>

      </div>
    </main>
  );
}
