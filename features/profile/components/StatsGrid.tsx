import { memo } from "react";

interface StatsPool {
  total: number;
  wins: number;
  losses: number;
  draws: number;
}

interface StatsGridProps {
  ratings: {
    bullet: number;
    blitz: number;
    rapid: number;
    daily: number;
  };
  stats: Record<string, StatsPool>;
}

const POOLS = [
  { id: "BULLET", name: "Bullet", icon: "🔫", key: "bullet" },
  { id: "BLITZ", name: "Blitz", icon: "⚡", key: "blitz" },
  { id: "RAPID", name: "Rapid", icon: "⏱️", key: "rapid" },
  { id: "DAILY", name: "Daily", icon: "📅", key: "daily" },
];

export const StatsGrid = memo(function StatsGrid({ ratings, stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {POOLS.map((pool) => {
        const rating = ratings[pool.key as keyof typeof ratings] || 1200;
        const poolStats = stats[pool.id] || { total: 0, wins: 0, losses: 0, draws: 0 };
        const { total, wins, losses, draws } = poolStats;

        // Compute percentages
        const winPercent = total > 0 ? (wins / total) * 100 : 0;
        const drawPercent = total > 0 ? (draws / total) * 100 : 0;
        const lossPercent = total > 0 ? (losses / total) * 100 : 0;

        return (
          <div
            key={pool.id}
            className="bg-cc-bg-card p-5 rounded-2xl border border-cc-border shadow-lg hover:border-cc-border-hover hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[170px]"
          >
            {/* Pool Header */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span>{pool.icon}</span> {pool.name}
              </span>
              <span className="text-[9px] text-cc-text-secondary font-mono font-bold bg-cc-bg-input px-2 py-0.5 rounded border border-cc-border-light">
                {total} Games
              </span>
            </div>

            {/* Rating Display */}
            <div className="my-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-cc-text-primary leading-none">
                {rating}
              </span>
              <span className="text-[10px] text-cc-text-secondary font-bold uppercase tracking-wider font-serif">
                Elo
              </span>
            </div>

            {/* Results Bar */}
            <div className="flex flex-col gap-1.5 mt-auto">
              <div className="flex justify-between text-[10px] font-bold font-mono text-cc-text-muted">
                <span>{wins}W</span>
                <span>{draws}D</span>
                <span>{losses}L</span>
              </div>
              <div className="w-full h-2 bg-cc-bg-sidebar rounded-full overflow-hidden flex">
                {total > 0 ? (
                  <>
                    <div style={{ width: `${winPercent}%` }} className="h-full bg-cc-green" title={`Wins: ${wins}`} />
                    <div style={{ width: `${drawPercent}%` }} className="h-full bg-cc-bg-hover" title={`Draws: ${draws}`} />
                    <div style={{ width: `${lossPercent}%` }} className="h-full bg-red-500" title={`Losses: ${losses}`} />
                  </>
                ) : (
                  <div className="w-full h-full bg-cc-border-light" title="No games played" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
