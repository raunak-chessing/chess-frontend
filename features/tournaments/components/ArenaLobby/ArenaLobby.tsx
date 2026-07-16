"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tournamentsApi } from '../../api/tournamentsApi';
import { getSocket } from '@/lib/socket-client';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';

export function ArenaLobby({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const onRoomJoined = (data: { room: string }) => {
      // Navigate to the live game
      router.push(`/play/online`);
    };
    socket.on('roomJoined', onRoomJoined);
    return () => {
      socket.off('roomJoined', onRoomJoined);
    };
  }, [router]);

  const fetchTournament = () => {
    tournamentsApi.getTournamentDetails(tournamentId)
      .then(data => {
        setTournament(data);
        if (session?.user) {
          const joined = data.players.some((p: any) => p.user.id === session.user.id);
          setIsJoined(joined);
        }
      })
      .catch(() => toast.error('Failed to load tournament'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTournament();
    const interval = setInterval(fetchTournament, 5000); // Polling for leaderboard updates
    return () => clearInterval(interval);
  }, [tournamentId, session]);

  const handleJoinLeave = async () => {
    if (!session?.user) {
      toast.error('You must be logged in to play');
      return;
    }
    
    if (!isJoined) {
      try {
        await tournamentsApi.joinTournament(tournamentId);
        setIsJoined(true);
        toast.success('Joined tournament!');
        fetchTournament();
      } catch (e) {
        toast.error('Failed to join tournament');
      }
    } else {
      // Just toggle queuing for now
      const socket = getSocket();
      if (isQueuing) {
        socket.emit('leaveQueue');
        setIsQueuing(false);
      } else {
        socket.emit('joinTournamentQueue', { tournamentId, timeControl: tournament.timeControl });
        setIsQueuing(true);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Arena...</div>;
  if (!tournament) return <div className="p-8 text-center">Arena not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      {/* Sidebar: Leaderboard */}
      <div className="w-full md:w-80 bg-surface border border-surface-highlight rounded-lg flex flex-col overflow-hidden h-[calc(100vh-8rem)]">
        <div className="bg-surface-highlight p-4 border-b border-surface">
          <h2 className="font-bold text-lg text-text-primary">Standings</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tournament.players.map((player: any, idx: number) => (
            <div key={player.id} className={`flex items-center justify-between p-3 border-b border-surface-highlight ${player.user.id === session?.user?.id ? 'bg-bg-hover' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="font-bold text-text-secondary w-5 text-right">{idx + 1}</span>
                <div>
                  <div className="font-semibold text-text-primary text-sm">{player.user.name}</div>
                  <div className="text-xs text-text-secondary">{player.user.rating}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {player.streak >= 2 && <span className="text-orange-500 text-xs font-bold px-1.5 py-0.5 rounded bg-orange-500/10">🔥 {player.streak}</span>}
                <span className="font-bold text-primary">{player.score}</span>
              </div>
            </div>
          ))}
          {tournament.players.length === 0 && (
            <div className="p-4 text-center text-sm text-text-secondary">No players yet.</div>
          )}
        </div>
      </div>

      {/* Main Area: Info & Matchmaking */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-surface border border-surface-highlight rounded-lg p-8 text-center flex flex-col items-center justify-center">
          <div className="text-4xl mb-4">🏆</div>
          <h1 className="text-3xl font-extrabold text-text-primary mb-2">{tournament.name}</h1>
          <div className="text-lg text-text-secondary mb-8">
            {tournament.timeControl} Arena • {tournament.status}
          </div>
          
          {tournament.status === 'IN_PROGRESS' ? (
            <button 
              onClick={handleJoinLeave}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md active:translate-y-1 ${
                !isJoined 
                  ? 'bg-primary hover:bg-primary-hover text-white' 
                  : isQueuing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {!isJoined ? 'Join Arena' : isQueuing ? 'Pause (Leave Queue)' : 'Return to Tournament (Find Match)'}
            </button>
          ) : (
            <div className="px-6 py-3 bg-surface-highlight text-text-secondary rounded-lg font-semibold">
              Tournament is {tournament.status.toLowerCase().replace('_', ' ')}
            </div>
          )}
          
          {isQueuing && (
            <div className="mt-6 text-sm text-primary animate-pulse font-semibold">
              Waiting for pairing...
            </div>
          )}
        </div>
        
        <div className="bg-surface border border-surface-highlight rounded-lg p-6">
          <h3 className="font-bold text-lg text-text-primary mb-3">Arena Rules</h3>
          <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm">
            <li>Win: 2 points, Draw: 1 point, Loss: 0 points.</li>
            <li>Win Streak: Winning 2 or more games in a row starts a streak.</li>
            <li>Streak Bonus: While on a streak, wins are worth 4 points!</li>
            <li>Matchmaking: You are paired against players close to your rating.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
