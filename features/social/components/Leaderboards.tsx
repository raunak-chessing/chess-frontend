import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { socialApi, LeaderboardUser, LeaderboardsData } from "../api/socialApi";
import { LoadingState } from "@/components/ui/LoadingState";
import { cn } from "@/lib/utils";

const RANK_MEDAL: Record<number, string> = {
  0: "bg-amber-400/15 text-amber-400 border-amber-400/40",
  1: "bg-slate-300/15 text-slate-300 border-slate-300/40",
  2: "bg-orange-600/15 text-orange-500 border-orange-600/40",
};

export function Leaderboards() {
  const [data, setData] = useState<LeaderboardsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"blitz" | "rapid" | "bullet">("blitz");

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        const json = await socialApi.getGlobalLeaderboard();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  if (loading || !data) {
    return (
      <LoadingState
        label="Loading leaderboards…"
        className="min-h-100 bg-cc-bg-card rounded-3xl border border-cc-border"
      />
    );
  }

  const list = data[activeTab];
  const getRatingField = (user: LeaderboardUser) => {
    if (activeTab === "bullet") return user.ratingBullet;
    if (activeTab === "blitz") return user.ratingBlitz;
    return user.ratingRapid;
  };

  return (
    <div className="bg-cc-bg-card rounded-3xl border border-cc-border shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="bg-cc-bg-sidebar p-6 border-b border-cc-border flex justify-between items-center">
        <h2 className="text-xl font-serif font-extrabold text-cc-text-primary flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Global Leaderboard
        </h2>
        <div className="flex bg-cc-bg-input rounded-xl p-1 border border-cc-border-light">
          {(["bullet", "blitz", "rapid"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-cc-bg-sidebar text-cc-text-primary shadow-sm"
                  : "text-cc-text-muted hover:text-cc-text-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {list.length === 0 ? (
          <div className="p-8 text-center text-cc-text-muted text-sm font-bold">No players found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-cc-bg-sidebar sticky top-0 z-10 text-[10px] uppercase font-bold text-cc-text-muted border-b border-cc-border">
              <tr>
                <th className="px-6 py-3 w-16 text-center">Rank</th>
                <th className="px-6 py-3">Player</th>
                <th className="px-6 py-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              {list.map((user, idx) => (
                <tr 
                  key={user.id} 
                  className="border-b border-cc-border-light hover:bg-cc-bg-hover transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-center">
                    {RANK_MEDAL[idx] ? (
                      <span
                        className={cn(
                          "inline-flex w-7 h-7 items-center justify-center rounded-full border font-mono font-bold text-xs",
                          RANK_MEDAL[idx],
                        )}
                      >
                        {idx + 1}
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-sm text-cc-text-secondary group-hover:text-cc-text-primary">
                        #{idx + 1}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <Image src={user.image} alt={user.name} width={32} height={32} className="rounded-md bg-cc-bg-input" />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-cc-bg-input flex items-center justify-center text-cc-text-muted font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-cc-text-primary">{user.name}</span>
                        {user.country && (
                          <span className="text-[10px] text-cc-text-muted font-mono uppercase">{user.country}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-lg text-cc-text-primary">
                    {getRatingField(user)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
