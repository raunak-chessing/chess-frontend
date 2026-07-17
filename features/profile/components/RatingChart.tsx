import { memo, useState, useEffect } from "react";

interface RecentGame {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  winner: string | null;
  status: string;
  gameType: string;
  createdAt: string;
}

interface RatingChartProps {
  userId: string;
}

export const RatingChart = memo(function RatingChart({ userId }: RatingChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<string>("30d");
  const [trajectory, setTrajectory] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4001/api/users/${userId}/rating-history?timeframe=${timeframe}`);
        const data = await res.json();
        // Assuming we just want to plot the rating values
        setTrajectory(data.map((d: any) => d.rating));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId, timeframe]);

  const hasHistory = trajectory.length > 0;

  if (!hasHistory) {
    return (
      <div className="bg-cc-bg-card p-5 rounded-3xl border border-cc-border shadow-2xl relative min-h-[260px] flex flex-col justify-center items-center text-center gap-2">
        <span className="text-3xl">📈</span>
        <span className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider">
          No Rating History
        </span>
        <p className="text-[10px] text-cc-text-muted max-w-xs leading-normal">
          Play matches in live rating pools to view your rating trajectory graph here!
        </p>
      </div>
    );
  }

  // SVG dimensions
  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 30;

  const minRating = Math.min(...trajectory) - 10;
  const maxRating = Math.max(...trajectory) + 10;
  const ratingRange = maxRating - minRating || 1;

  const getCoordinates = (val: number, idx: number) => {
    const totalPoints = trajectory.length;
    const x = paddingX + (idx * (width - 2 * paddingX)) / (totalPoints - 1 || 1);
    const y = height - paddingY - ((val - minRating) * (height - 2 * paddingY)) / ratingRange;
    return { x, y };
  };

  // Generate coordinates
  const coords = trajectory.map((val, idx) => getCoordinates(val, idx));

  // Build svg path string
  let pathStr = "";
  if (coords.length > 0) {
    pathStr = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      pathStr += ` L ${coords[i].x} ${coords[i].y}`;
    }
  }

  // Build gridlines
  const gridlineCount = 4;
  const gridlines = Array.from({ length: gridlineCount }).map((_, i) => {
    const val = minRating + (i * ratingRange) / (gridlineCount - 1);
    const y = height - paddingY - ((val - minRating) * (height - 2 * paddingY)) / ratingRange;
    return { val: Math.round(val), y };
  });

  return (
    <div className="bg-cc-bg-card p-5 rounded-3xl border border-cc-border shadow-2xl relative">
      <div className="flex justify-between items-center border-b border-cc-border-light pb-3 mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider">
            Rating History
          </span>
          <span className="text-[9px] font-medium text-cc-text-muted">
            Last {trajectory.length} matches
          </span>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "1y", "all"].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${timeframe === tf ? 'bg-cc-bg-hover text-cc-text-primary' : 'text-cc-text-muted hover:text-cc-text-secondary'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full aspect-[5/2] sm:aspect-[5/2]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none overflow-visible">
          {/* Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b38e74" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#b38e74" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridlines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={line.y}
                x2={width - paddingX}
                y2={line.y}
                stroke="var(--cc-border-light)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 10}
                y={line.y + 3}
                fill="var(--cc-text-muted)"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="end"
              >
                {line.val}
              </text>
            </g>
          ))}

          {/* Gradient area under the line */}
          {coords.length > 0 && (
            <path
              d={`${pathStr} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`}
              fill="url(#chartGradient)"
            />
          )}

          {/* Rating line */}
          <path d={pathStr} fill="none" stroke="var(--cc-border)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots on line */}
          {coords.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === idx ? 5.5 : 3.5}
              fill={hoveredIdx === idx ? "var(--cc-green)" : "var(--cc-bg-sidebar)"}
              stroke={hoveredIdx === idx ? "#ffffff" : "var(--cc-border)"}
              strokeWidth="2"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer transition-all duration-200"
            />
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-cc-bg-sidebar/95 border border-cc-border-light px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono text-cc-text-primary shadow-xl pointer-events-none z-25"
            style={{
              left: `${(coords[hoveredIdx].x / width) * 100}%`,
              top: `${(coords[hoveredIdx].y / height) * 100 - 22}%`,
              transform: "translateX(-50%)",
            }}
          >
            {trajectory[hoveredIdx]} Elo
          </div>
        )}
      </div>
    </div>
  );
});
