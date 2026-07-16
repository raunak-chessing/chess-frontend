import { memo } from "react";

interface StrikeTrackerProps {
  strikes: number;
  maxStrikes?: number;
}

export const StrikeTracker = memo(function StrikeTracker({ strikes, maxStrikes = 3 }: StrikeTrackerProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-zinc-400 font-semibold uppercase font-serif">Strikes</span>
      <div className="flex gap-1">
        {Array.from({ length: maxStrikes }).map((_, i) => {
          const idx = i + 1;
          return (
            <span
              key={idx}
              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                strikes >= idx
                  ? "bg-red-600/90 border-red-500 text-white"
                  : "bg-zinc-800/60 border-zinc-700 text-zinc-600"
              }`}
            >
              X
            </span>
          );
        })}
      </div>
    </div>
  );
});
