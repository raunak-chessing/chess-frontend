"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';
import { tournamentsApi, Tournament } from '../../api/tournamentsApi';
import { Card } from '../../../../components/ui/Card';
import { SectionHeader } from '../../../../components/ui/SectionHeader';
import { PromptDialog } from '@/components/ui/PromptDialog';
import { LoadingState } from '@/components/ui/LoadingState';
import { BlurText } from '@/components/react-bits';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';

type CreateKind = 'arena' | 'swiss' | null;

export function TournamentsList() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [createKind, setCreateKind] = useState<CreateKind>(null);

  useEffect(() => {
    tournamentsApi.getTournaments()
      .then(setTournaments)
      .catch(() => toast.error('Failed to load tournaments'))
      .finally(() => setLoading(false));
  }, []);

  const requireSession = (message: string) => {
    if (!session?.user) {
      toast.error(message);
      return false;
    }
    return true;
  };

  const handleCreateArena = () => {
    if (requireSession('Must be logged in to create an arena')) setCreateKind('arena');
  };

  const handleCreateSwiss = () => {
    if (requireSession('Must be logged in to create a Swiss tournament')) setCreateKind('swiss');
  };

  const handleConfirmCreate = async (name: string) => {
    try {
      if (createKind === 'arena') {
        const newArena = await tournamentsApi.createArena({
          name,
          timeControl: '3|0',
          durationMinutes: 60,
          startsInMinutes: 5,
        });
        toast.success('Arena created!');
        router.push(`/tournaments/${newArena.id}`);
      } else if (createKind === 'swiss') {
        const newSwiss = await tournamentsApi.createSwiss({
          name,
          timeControl: '10|0',
          maxRounds: 5,
          startsInMinutes: 5,
        });
        toast.success('Swiss tournament created!');
        router.push(`/tournaments/${newSwiss.id}`);
      }
    } catch (e) {
      toast.error(createKind === 'arena' ? 'Failed to create arena' : 'Failed to create Swiss tournament');
    }
  };

  if (loading) {
    return <LoadingState variant="fill" label="Loading tournaments…" />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <BlurText
            text="Arena Tournaments"
            animateBy="words"
            direction="top"
            className="text-3xl font-bold text-cc-text-primary mb-2"
          />
          <p className="text-cc-text-secondary">Compete in fast-paced arenas, streak for extra points, and climb the leaderboards!</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateArena}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:translate-y-1"
          >
            + Create Arena
          </button>
          <button
            onClick={handleCreateSwiss}
            className="bg-cc-bg-sidebar hover:bg-cc-bg-card border border-primary text-primary px-6 py-3 rounded-xl font-bold transition-all shadow-md active:translate-y-1"
          >
            + Create Swiss
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SectionHeader>Upcoming & Active Tournaments</SectionHeader>
        <div className="flex flex-col gap-4">
          {tournaments.map(tournament => (
            <Card
              key={tournament.id}
              interactive
              spotlightColor="rgba(129, 182, 76, 0.3)"
              className="p-4 cursor-pointer flex justify-between items-center"
              onClick={() => router.push(`/tournaments/${tournament.id}`)}
            >
              <div>
                <h3 className="font-bold text-cc-text-primary text-xl flex items-center gap-2">
                  <Trophy size={20} className="text-cc-accent-gold" /> {tournament.name}
                </h3>
                <div className="text-sm text-cc-text-secondary mt-1">
                  {tournament.timeControl} • {tournament.type} • {tournament.status}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono font-semibold text-cc-text-primary">
                  {tournament.startTime ? new Date(tournament.startTime).toLocaleString() : 'TBD'}
                </span>
                <span className="text-sm text-primary font-bold">Join Arena &rarr;</span>
              </div>
            </Card>
          ))}

          {tournaments.length === 0 && (
            <div className="text-center py-10 text-cc-text-secondary bg-cc-bg-card rounded-xl border border-cc-border-light">
              No tournaments available right now.
            </div>
          )}
        </div>
      </div>

      <PromptDialog
        open={createKind !== null}
        onOpenChange={(open) => !open && setCreateKind(null)}
        title={createKind === 'arena' ? 'Create Arena' : 'Create Swiss Tournament'}
        label={createKind === 'arena' ? 'Arena name' : 'Tournament name'}
        placeholder={createKind === 'arena' ? 'Friday Night Blitz' : 'Weekend Swiss'}
        onConfirm={handleConfirmCreate}
      />
    </div>
  );
}
