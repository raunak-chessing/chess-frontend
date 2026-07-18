'use client';

import { useEffect, useState } from 'react';
import { getFactions, joinFaction, Faction } from '../api/factionsApi';
import { authClient } from '@/lib/auth-client';
import { Swords, Shield, Skull, Globe } from 'lucide-react';
import type { ElementType } from 'react';
import type { ChessUser } from '@/types/auth.types';
import toast from 'react-hot-toast';

const FACTION_ICONS: Record<string, ElementType> = {
  'The Queen\'s Vanguard': Shield,
  'The Sicilian Syndicate': Skull,
  'The Iron Knights': Swords,
};

const FACTION_COLORS: Record<string, string> = {
  amber: 'from-amber-400 to-amber-600 border-amber-500/50 text-amber-400',
  red: 'from-red-500 to-rose-700 border-red-500/50 text-red-400',
  blue: 'from-blue-400 to-blue-600 border-blue-500/50 text-blue-400',
};

export function FactionMap() {
  const { data: session } = authClient.useSession();
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [userFactionId, setUserFactionId] = useState<string | null>(null);

  const fetchFactions = async () => {
    try {
      const data = await getFactions();
      setFactions(data);
    } catch (err) {
      console.error('Failed to load factions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactions();
    const user = session?.user as ChessUser | undefined;
    if (user?.factionId) {
      setUserFactionId(user.factionId);
    }
  }, [session]);

  const handleJoin = async (factionId: string) => {
    setJoining(true);
    try {
      await joinFaction(factionId);
      setUserFactionId(factionId);
      toast.success('Pledged allegiance to your new faction!');
      fetchFactions();
    } catch (err) {
      toast.error('Failed to join faction.');
    } finally {
      setJoining(false);
    }
  };

  if (!session) return null;

  const totalGlobalScore = factions.reduce((acc, f) => acc + f.totalScore, 0) || 1;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-2xl relative overflow-hidden group col-span-1 lg:col-span-12 w-full mt-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-neutral-900/0 to-neutral-900/0 z-0 pointer-events-none" />
      <div className="relative z-10 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-400" />
            GLOBAL FACTION WARS
          </h2>
        </div>

        {loading ? (
          <div className="flex gap-4 animate-pulse">
            <div className="h-40 w-1/3 bg-neutral-800 rounded-lg" />
            <div className="h-40 w-1/3 bg-neutral-800 rounded-lg" />
            <div className="h-40 w-1/3 bg-neutral-800 rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="w-full bg-neutral-800 h-6 rounded-full overflow-hidden flex shadow-inner">
              {factions.map(faction => {
                const percent = Math.max(5, (faction.totalScore / totalGlobalScore) * 100);
                const colors = FACTION_COLORS[faction.colorTheme] || FACTION_COLORS['blue'];
                const bgGradient = colors.split(' ').filter(c => c.startsWith('from-') || c.startsWith('to-')).join(' ');
                return (
                  <div 
                    key={faction.id} 
                    className={`h-full bg-gradient-to-r ${bgGradient} transition-all duration-1000 border-r border-neutral-900 last:border-0 relative group/bar`}
                    style={{ width: `${percent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors cursor-pointer" title={`${faction.name}: ${faction.totalScore} pts`} />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {factions.map((faction, i) => {
                const Icon = FACTION_ICONS[faction.name] || Shield;
                const isMember = userFactionId === faction.id;
                const colors = FACTION_COLORS[faction.colorTheme] || FACTION_COLORS['blue'];
                const textColor = colors.split(' ').find(c => c.startsWith('text-'));

                return (
                  <div key={faction.id} className={`bg-neutral-800/50 rounded-xl p-4 border transition-all ${isMember ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-[1.02]' : 'border-neutral-700/50 hover:border-neutral-600'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-neutral-900 border border-neutral-700 ${textColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm lg:text-base ${textColor}`}>{faction.name}</h3>
                        <p className="text-xs text-neutral-400 font-medium">Rank #{i + 1} &bull; {faction._count?.users || 0} Members</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-neutral-300 mb-4 h-10">{faction.description}</p>
                    
                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-xl font-black text-white">{faction.totalScore.toLocaleString()} <span className="text-xs font-semibold text-neutral-500">PTS</span></div>
                      
                      {!userFactionId && (
                        <button 
                          onClick={() => handleJoin(faction.id)}
                          disabled={joining}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${colors.split(' ').slice(0, 2).join(' ')} hover:brightness-110 active:scale-95 transition-all`}
                        >
                          Pledge
                        </button>
                      )}
                      
                      {isMember && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold uppercase rounded-md border border-blue-500/30">
                          Your Faction
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
