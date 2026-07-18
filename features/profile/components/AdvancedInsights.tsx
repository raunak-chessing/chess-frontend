import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { profileApi, AdvancedInsightsResponse } from "../api/profileApi";

interface InsightsProps {
  userId: string;
}

export function AdvancedInsights({ userId }: InsightsProps) {
  const [data, setData] = useState<AdvancedInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const json = await profileApi.getAdvancedInsights(userId);
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-cc-text-muted bg-cc-bg-card rounded-3xl border border-cc-border">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Insights...</p>
      </div>
    );
  }

  const renderColorStats = (color: string, stats: { wins: number; losses: number; draws: number }) => {
    const total = stats.wins + stats.losses + stats.draws;
    if (total === 0) return <div className="text-cc-text-muted text-xs">No games played as {color}</div>;

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center text-xs font-bold font-mono">
          <span className="capitalize">{color}</span>
          <span className="text-cc-text-muted">{total} Games</span>
        </div>
        <div className="w-full h-3 bg-cc-bg-sidebar rounded-full overflow-hidden flex">
          <div style={{ width: `${(stats.wins / total) * 100}%` }} className="h-full bg-cc-green" title={`Wins: ${stats.wins}`} />
          <div style={{ width: `${(stats.draws / total) * 100}%` }} className="h-full bg-cc-bg-hover" title={`Draws: ${stats.draws}`} />
          <div style={{ width: `${(stats.losses / total) * 100}%` }} className="h-full bg-red-500" title={`Losses: ${stats.losses}`} />
        </div>
        <div className="flex justify-between text-[10px] text-cc-text-muted font-bold font-mono">
          <span>{((stats.wins / total) * 100).toFixed(1)}% W</span>
          <span>{((stats.draws / total) * 100).toFixed(1)}% D</span>
          <span>{((stats.losses / total) * 100).toFixed(1)}% L</span>
        </div>
      </div>
    );
  };

  const topOpenings = Object.entries(data.openings)
    .sort((a, b) => {
      const aTotal = a[1].wins + a[1].losses + a[1].draws;
      const bTotal = b[1].wins + b[1].losses + b[1].draws;
      return bTotal - aTotal;
    })
    .slice(0, 5);

  const totalTimeGames = data.timeOfDay.morning + data.timeOfDay.afternoon + data.timeOfDay.evening + data.timeOfDay.night;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Color Stats */}
      <div className="bg-cc-bg-card p-5 rounded-3xl border border-cc-border shadow-xl flex flex-col gap-4">
        <h3 className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider border-b border-cc-border-light pb-2">
          Performance by Color
        </h3>
        {renderColorStats('white', data.white)}
        <div className="h-px w-full bg-cc-border-light my-2"></div>
        {renderColorStats('black', data.black)}
      </div>

      {/* Top Openings */}
      <div className="bg-cc-bg-card p-5 rounded-3xl border border-cc-border shadow-xl flex flex-col gap-4">
        <h3 className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider border-b border-cc-border-light pb-2">
          Top Openings
        </h3>
        <div className="flex flex-col gap-3">
          {topOpenings.length === 0 ? (
            <div className="text-cc-text-muted text-xs">No openings data available</div>
          ) : (
            topOpenings.map(([opening, stats]) => {
              const total = stats.wins + stats.losses + stats.draws;
              const winRate = ((stats.wins / total) * 100).toFixed(0);
              return (
                <div key={opening} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-cc-text-primary truncate pr-2">{opening}</span>
                    <span className="text-[10px] text-cc-text-muted font-mono">{total}g</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-cc-bg-sidebar rounded-full overflow-hidden flex">
                      <div style={{ width: `${(stats.wins / total) * 100}%` }} className="h-full bg-cc-green" />
                      <div style={{ width: `${(stats.draws / total) * 100}%` }} className="h-full bg-cc-bg-hover" />
                      <div style={{ width: `${(stats.losses / total) * 100}%` }} className="h-full bg-red-500" />
                    </div>
                    <span className="text-[10px] font-bold text-cc-green w-6 text-right">{winRate}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Time of Day */}
      <div className="bg-cc-bg-card p-5 rounded-3xl border border-cc-border shadow-xl flex flex-col gap-4">
        <h3 className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider border-b border-cc-border-light pb-2">
          Time of Day
        </h3>
        {totalTimeGames === 0 ? (
          <div className="text-cc-text-muted text-xs">No time data available</div>
        ) : (
          <div className="flex flex-col gap-3 justify-center flex-1">
            {[
              { label: "Morning (5A-12P)", count: data.timeOfDay.morning, icon: "🌅" },
              { label: "Afternoon (12P-5P)", count: data.timeOfDay.afternoon, icon: "☀️" },
              { label: "Evening (5P-9P)", count: data.timeOfDay.evening, icon: "🌆" },
              { label: "Night (9P-5A)", count: data.timeOfDay.night, icon: "🌙" },
            ].map(t => (
              <div key={t.label} className="flex items-center justify-between group cursor-default">
                <span className="text-xs font-bold text-cc-text-secondary group-hover:text-cc-text-primary transition-colors flex items-center gap-2">
                  <span>{t.icon}</span> {t.label}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-cc-bg-sidebar rounded-full overflow-hidden">
                    <div style={{ width: `${(t.count / totalTimeGames) * 100}%` }} className="h-full bg-cc-accent-blue opacity-80" />
                  </div>
                  <span className="text-[10px] font-mono text-cc-text-muted w-6 text-right">{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
