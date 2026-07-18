"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tournamentsApi, Tournament } from '../../api/tournamentsApi';
import { Card } from '../../../../components/ui/Card';
import { SectionHeader } from '../../../../components/ui/SectionHeader';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';

export function TournamentsList() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tournamentsApi.getTournaments()
      .then(setTournaments)
      .catch(() => toast.error('Failed to load tournaments'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateArena = async () => {
    if (!session?.user) {
      toast.error('Must be logged in to create an arena');
      return;
    }
    const name = prompt('Arena name:');
    if (!name) return;
    try {
      const newArena = await tournamentsApi.createArena({
        name,
        timeControl: '3|0',
        durationMinutes: 60,
        startsInMinutes: 5,
      });
      toast.success('Arena created!');
      router.push(`/tournaments/${newArena.id}`);
    } catch (e) {
      toast.error('Failed to create arena');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-text-secondary">Loading tournaments...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Arena Tournaments</h1>
          <p className="text-text-secondary">Compete in fast-paced arenas, streak for extra points, and climb the leaderboards!</p>
        </div>
        <button 
          onClick={handleCreateArena}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:translate-y-1"
        >
          + Create Arena (Test)
        </button>
      </div>

      <div className="space-y-4">
        <SectionHeader>Upcoming & Active Tournaments</SectionHeader>
        <div className="flex flex-col gap-4">
          {tournaments.map(tournament => (
            <Card 
              key={tournament.id} 
              className="p-4 cursor-pointer hover:border-primary transition-colors flex justify-between items-center bg-surface"
              onClick={() => router.push(`/tournaments/${tournament.id}`)}
            >
              <div>
                <h3 className="font-bold text-text-primary text-xl flex items-center gap-2">
                  <span className="text-2xl">🏆</span> {tournament.name}
                </h3>
                <div className="text-sm text-text-secondary mt-1">
                  {tournament.timeControl} • {tournament.type} • {tournament.status}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono font-semibold text-text-primary">
                  {tournament.startTime ? new Date(tournament.startTime).toLocaleString() : 'TBD'}
                </span>
                <span className="text-sm text-primary font-bold">Join Arena &rarr;</span>
              </div>
            </Card>
          ))}
          
          {tournaments.length === 0 && (
            <div className="text-center py-10 text-text-secondary bg-surface rounded-xl border border-surface-highlight">
              No tournaments available right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
