'use client';

import { useEffect, useState } from 'react';
import { getActiveQuests, claimQuest, Quest } from '../api/questsApi';
import { Target, Trophy, Flame, CheckCircle, Clock } from 'lucide-react';
import type { ElementType } from 'react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';

const QUEST_LABELS: Record<string, { title: string; icon: ElementType }> = {
  WIN_GAMES: { title: 'Win Games', icon: Trophy },
  SOLVE_PUZZLES: { title: 'Solve Puzzles', icon: Target },
  PLAY_BATTLES: { title: 'Play Puzzle Battles', icon: Flame },
  WIN_PUZZLE_BATTLE: { title: 'Win a Puzzle Battle', icon: Flame },
};

export function QuestWidget() {
  const { data: session } = authClient.useSession();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    
    const fetchQuests = async () => {
      try {
        const data = await getActiveQuests();
        setQuests(data);
      } catch (err) {
        console.error('Failed to load quests', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, [session]);

  const handleClaim = async (questId: string) => {
    try {
      const res = await claimQuest(questId);
      if (res.success) {
        toast.success(`Claimed ${res.reward.gold} Gold and ${res.reward.aetherium} Aetherium!`);
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, rewardClaimed: true } : q));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to claim reward');
    }
  };

  if (!session) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 z-0" />
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            DAILY BOUNTIES
          </h2>
          <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" /> Resets in 24h
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-neutral-800/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {quests.length === 0 ? (
              <p className="text-neutral-500 text-sm italic">No active bounties right now.</p>
            ) : (
              quests.map(quest => {
                const labelData = QUEST_LABELS[quest.questId] || { title: quest.questId, icon: Target };
                const Icon = labelData.icon;
                const percentage = Math.min(100, Math.round((quest.progress / quest.target) * 100));

                return (
                  <div key={quest.id} className="relative bg-neutral-800/80 rounded-lg p-3 overflow-hidden border border-neutral-700/50 transition-colors hover:border-amber-500/30">
                    {quest.completed && (
                      <div className="absolute inset-0 bg-amber-500/10 z-0 animate-pulse" />
                    )}
                    
                    <div className="relative z-10 flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${quest.completed ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-700 text-neutral-400'}`}>
                          {quest.completed ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <span className={`font-medium text-sm ${quest.completed ? 'text-amber-100' : 'text-neutral-200'}`}>
                          {labelData.title}
                        </span>
                      </div>
                      <span className={`font-bold text-sm ${quest.completed ? 'text-amber-400' : 'text-neutral-400'}`}>
                        {quest.progress} / {quest.target}
                      </span>
                    </div>

                    <div className="w-full bg-neutral-900 rounded-full h-2 relative z-10 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ease-out ${quest.completed ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'bg-neutral-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    {quest.completed && !quest.rewardClaimed && (
                      <button
                        onClick={() => handleClaim(quest.id)}
                        className="mt-3 w-full py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs rounded-md shadow-lg transition-transform active:scale-95 relative z-10"
                      >
                        Claim Reward
                      </button>
                    )}
                    {quest.completed && quest.rewardClaimed && (
                      <div className="mt-3 w-full py-1.5 bg-neutral-800 text-neutral-500 font-bold text-xs text-center rounded-md relative z-10">
                        Claimed
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
