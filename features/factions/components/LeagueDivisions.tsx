import React, { useEffect, useState } from 'react';
import { getDivisions, Division } from '../api/factionsApi';
import { Loader2, Shield, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function LeagueDivisions() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    getDivisions()
      .then(data => {
        setDivisions(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-cc-text-muted bg-cc-bg-card rounded-3xl border border-cc-border">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-wider">Loading League Standings...</p>
      </div>
    );
  }

  // Find user's division, otherwise default to first division
  const activeDivision = divisions.find(d => d.users.some(u => u.id === user?.id)) || divisions[0];

  if (!activeDivision) {
    return (
      <div className="p-12 text-center text-cc-text-muted bg-cc-bg-card rounded-3xl border border-cc-border">
        No active divisions found.
      </div>
    );
  }

  const usersCount = activeDivision.users.length;
  const promoteCount = Math.max(1, Math.floor(usersCount * 0.2));
  const relegateCount = Math.max(1, Math.floor(usersCount * 0.2));

  return (
    <div className="bg-cc-bg-card rounded-3xl border border-cc-border shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="bg-cc-bg-sidebar p-6 border-b border-cc-border flex justify-between items-center">
        <h2 className="text-xl font-serif font-extrabold text-cc-text-primary flex items-center gap-3">
          <Shield className="w-6 h-6 text-indigo-500" />
          {activeDivision.tier} League
        </h2>
        <div className="text-xs font-bold text-cc-text-muted">
          Season Ends: {new Date(activeDivision.seasonEnd).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-cc-bg-sidebar sticky top-0 z-10 text-[10px] uppercase font-bold text-cc-text-muted border-b border-cc-border">
            <tr>
              <th className="px-6 py-3 w-16 text-center">Rank</th>
              <th className="px-6 py-3">Player</th>
              <th className="px-6 py-3 text-right">Contribution</th>
              <th className="px-6 py-3 w-24 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {activeDivision.users.map((u, idx) => {
              const isPromoting = idx < promoteCount;
              const isRelegating = idx >= usersCount - relegateCount;
              const isCurrentUser = u.id === user?.id;

              return (
                <tr 
                  key={u.id} 
                  className={`border-b border-cc-border-light transition-colors ${
                    isCurrentUser ? 'bg-indigo-900/30 hover:bg-indigo-900/50' : 'hover:bg-cc-bg-hover'
                  }`}
                >
                  <td className="px-6 py-4 font-mono font-bold text-sm text-center text-cc-text-secondary">
                    #{idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${isCurrentUser ? 'text-indigo-400' : 'text-cc-text-primary'}`}>
                      {u.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-sm text-cc-text-primary">
                    {u.factionContribution}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {isPromoting ? (
                      <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-green-500 uppercase">
                        <ArrowUp className="w-3 h-3" /> Promotes
                      </span>
                    ) : isRelegating ? (
                      <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-red-500 uppercase">
                        <ArrowDown className="w-3 h-3" /> Relegates
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-[10px] font-bold text-cc-text-muted uppercase">
                        <Minus className="w-3 h-3" /> Stays
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
