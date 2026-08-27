"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '../../../../components/ui/SectionHeader';
import { tournamentsApi, Tournament, TournamentPlayer, TournamentPairing } from '../../api/tournamentsApi';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';

export function SwissLobby({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [pairings, setPairings] = useState<TournamentPairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  const currentRound = tournament?.rounds?.[0]?.roundNumber ?? 0;

  const fetchTournament = useCallback(() => {
    tournamentsApi.getTournamentDetails(tournamentId)
      .then((data) => {
        setTournament(data);
        if (session?.user && data.players) {
          const joined = data.players.some((p: TournamentPlayer) => p.user?.id === session.user.id) ?? false;
          setIsJoined(joined);
        }
      })
      .catch(() => toast.error('Failed to load tournament'))
      .finally(() => setLoading(false));
  }, [tournamentId, session]);

  useEffect(() => {
    fetchTournament();
    const interval = setInterval(fetchTournament, 5000);
    return () => clearInterval(interval);
  }, [fetchTournament]);

  useEffect(() => {
    if (currentRound < 1) {
      setPairings([]);
      return;
    }
    tournamentsApi.getPairings(tournamentId, currentRound)
      .then(setPairings)
      .catch(() => {});
  }, [tournamentId, currentRound]);

  const handleJoin = async () => {
    if (!session?.user) {
      toast.error('You must be logged in to play');
      return;
    }
    try {
      await tournamentsApi.joinTournament(tournamentId);
      setIsJoined(true);
      toast.success('Joined tournament! Wait for the round pairings.');
      fetchTournament();
    } catch (e) {
      toast.error('Failed to join tournament');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Swiss Tournament...</div>;
  if (!tournament) return <div className="p-8 text-center">Tournament not found</div>;

  const myPairing = pairings.find(
    (p) => p.whitePlayerId === session?.user?.id || p.blackPlayerId === session?.user?.id,
  );

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-80 bg-surface border border-surface-highlight rounded-lg flex flex-col overflow-hidden h-[calc(100vh-8rem)]">
        <div className="bg-surface-highlight p-4 border-b border-surface">
          <h2 className="font-bold text-lg text-text-primary">Standings</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tournament.players?.map((player: TournamentPlayer, idx: number) => (
            <div key={player.id} className={`flex items-center justify-between p-3 border-b border-surface-highlight ${player.user.id === session?.user?.id ? 'bg-bg-hover' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="font-bold text-text-secondary w-5 text-right">
                  {player.rank ?? idx + 1}
                </span>
                <div>
                  <div className="font-semibold text-text-primary text-sm">{player.user.name}</div>
                  <div className="text-xs text-text-secondary">{player.user.rating}</div>
                </div>
              </div>
              <span className="font-bold text-primary">{player.score}</span>
            </div>
          ))}
          {(!tournament.players || tournament.players.length === 0) && (
            <div className="p-4 text-center text-sm text-text-secondary">No players yet.</div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-surface border border-surface-highlight rounded-lg p-8 text-center flex flex-col items-center justify-center">
          <div className="text-4xl mb-4">♟️</div>
          <h1 className="text-2xl font-black font-serif text-text-primary">{tournament.name}</h1>
          <div className="text-lg text-text-secondary mb-2">
            {tournament.timeControl} Swiss • {tournament.status}
          </div>
          <div className="text-sm text-text-secondary mb-8">
            Round {currentRound || '-'} of {tournament.maxRounds ?? '?'}
          </div>

          {tournament.status === 'UPCOMING' && !isJoined && (
            <button
              onClick={handleJoin}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md active:translate-y-1 bg-primary hover:bg-primary-hover text-white"
            >
              Join Swiss Tournament
            </button>
          )}

          {tournament.status === 'UPCOMING' && isJoined && (
            <div className="px-6 py-3 bg-surface-highlight text-text-secondary rounded-lg font-semibold">
              Waiting for the tournament to start...
            </div>
          )}

          {tournament.status === 'IN_PROGRESS' && myPairing?.isBye && (
            <div className="px-6 py-3 bg-surface-highlight text-text-secondary rounded-lg font-semibold">
              You have a bye this round.
            </div>
          )}

          {tournament.status === 'IN_PROGRESS' && myPairing?.gameId && !myPairing.result && (
            <button
              onClick={() => router.push(`/play/online?gameId=${myPairing.gameId}`)}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md active:translate-y-1 bg-green-500 hover:bg-green-600 text-white"
            >
              Go to My Game
            </button>
          )}

          {tournament.status === 'IN_PROGRESS' && !myPairing && (
            <div className="px-6 py-3 bg-surface-highlight text-text-secondary rounded-lg font-semibold">
              Waiting for the next round's pairings...
            </div>
          )}

          {tournament.status === 'COMPLETED' && (
            <div className="px-6 py-3 bg-surface-highlight text-text-secondary rounded-lg font-semibold">
              Tournament complete. Final standings on the left.
            </div>
          )}
        </div>

        <div className="bg-surface border border-surface-highlight rounded-lg p-6">
          <h3 className="font-bold text-lg text-text-primary mb-3">Round {currentRound || '-'} Pairings</h3>
          <div className="flex flex-col gap-2">
            {pairings.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-surface-highlight/50">
                <span className="font-semibold text-text-primary">{p.whitePlayer.name}</span>
                <span className="text-text-secondary text-xs">
                  {p.isBye ? 'BYE' : p.result ? p.result : 'vs'}
                </span>
                <span className="font-semibold text-text-primary">{p.blackPlayer?.name ?? '-'}</span>
              </div>
            ))}
            {pairings.length === 0 && (
              <div className="text-center text-sm text-text-secondary py-4">No pairings yet.</div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-surface-highlight rounded-lg p-6">
          <h3 className="font-bold text-lg text-text-primary mb-3">Swiss Rules</h3>
          <ul className="list-disc pl-5 space-y-2 text-text-secondary text-sm">
            <li>Win: 2 points, Draw: 1 point, Loss: 0 points.</li>
            <li>Win Streak: Winning 2 or more games in a row starts a streak.</li>
            <li>Streak Bonus: While on a streak, wins are worth 4 points!</li>
            <li>Pairing: Each round pairs players with similar scores, avoiding rematches when possible.</li>
            <li>Byes: If the field is odd, the lowest-scoring player without a prior bye receives one automatically.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
