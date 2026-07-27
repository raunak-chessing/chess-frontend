'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api-client';

export interface HexData {
  id: string;
  q: number;
  r: number;
  s: number;
  terrain: string;
  hp: number;
  maxHp: number;
  controllingFactionId: string | null;
  controllingFactionName: string | null;
  structures: { id: string; type: string }[];
}

interface HexDetailsPanelProps {
  hex: HexData | null;
  onClose: () => void;
  onStructureBuilt: () => void;
}

export function HexDetailsPanel({ hex, onClose, onStructureBuilt }: HexDetailsPanelProps) {
  const { user } = useAuthStore();
  const [isBuilding, setIsBuilding] = useState(false);

  if (!hex) return null;

  const isControlledByMyFaction = user?.factionId === hex.controllingFactionId;
  const isWarlord = user?.factionRank === 'WARLORD';
  
  const handleBuild = async (type: string) => {
    setIsBuilding(true);
    try {
      await apiClient.post('/api/overworld/build', { hexId: hex.id, type });
      toast.success(`${type} constructed successfully!`);
      onStructureBuilt();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to build structure');
    } finally {
      setIsBuilding(false);
    }
  };

  const hpPercentage = Math.max(0, Math.min(100, (hex.hp / hex.maxHp) * 100));

  return (
    <div className="absolute right-4 top-24 w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-100 uppercase tracking-wider text-sm">Hex {hex.q},{hex.r}</h3>
          <p className="text-xs text-slate-400 capitalize">{hex.terrain} Terrain</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Faction Control */}
        <div>
          <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Controlled By</div>
          <div className={`font-bold ${hex.controllingFactionName ? 'text-amber-400' : 'text-slate-500'}`}>
            {hex.controllingFactionName || 'Unclaimed Wilds'}
          </div>
        </div>

        {/* HP Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400 font-semibold uppercase">Fortification HP</span>
            <span className="text-slate-300">{hex.hp.toLocaleString()} / {hex.maxHp.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-amber-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        {/* Active Structures */}
        {hex.structures.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Active Structures</div>
            <div className="flex flex-wrap gap-2">
              {hex.structures.map(s => (
                <span key={s.id} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs rounded-md font-medium">
                  {s.type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Construction Panel (WARLORDS ONLY) */}
        {isControlledByMyFaction && isWarlord && (
          <div className="pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-3">Construction Queue</div>
            
            <div className="space-y-2">
              <button 
                disabled={isBuilding}
                onClick={() => handleBuild('CITADEL')}
                className="w-full p-3 flex justify-between items-center bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-200">Citadel</div>
                  <div className="text-[10px] text-slate-400">Boosts Max HP by 300%</div>
                </div>
                <div className="text-xs font-mono text-amber-500">10k G</div>
              </button>

              <button 
                disabled={isBuilding}
                onClick={() => handleBuild('WATCHTOWER')}
                className="w-full p-3 flex justify-between items-center bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-200">Watchtower</div>
                  <div className="text-[10px] text-slate-400">Expands Vision Radius</div>
                </div>
                <div className="text-xs font-mono text-amber-500">5k G</div>
              </button>

              <button 
                disabled={isBuilding}
                onClick={() => handleBuild('AETHERIUM_FORGE')}
                className="w-full p-3 flex justify-between items-center bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 rounded-xl transition-all disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-200">Aetherium Forge</div>
                  <div className="text-[10px] text-slate-400">Doubles resource yield</div>
                </div>
                <div className="text-xs font-mono text-purple-400">15k A</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
