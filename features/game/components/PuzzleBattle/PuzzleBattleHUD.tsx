"use client";

import { memo } from "react";
import { Swords } from "lucide-react";

interface PuzzleBattleHUDProps {
  roundIndex: number;
  totalRounds: number;
  playerScore: number;
  opponentScore: number;
  roundTimeMs: number;
  phase: string;
}

export const PuzzleBattleHUD = memo(function PuzzleBattleHUD({
  roundIndex,
  totalRounds,
  playerScore,
  opponentScore,
  roundTimeMs,
  phase,
}: PuzzleBattleHUDProps) {
  const timeSeconds = (roundTimeMs / 1000).toFixed(1);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-2 min-w-[100px]">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-cc-text-muted font-serif">
          Round
        </span>
        <span className="text-2xl font-black text-cc-text-primary font-mono">
          {Math.min(roundIndex + 1, totalRounds)}
          <span className="text-sm text-cc-text-muted font-semibold">/{totalRounds}</span>
        </span>
      </div>

      <div className="flex gap-2 items-center">
        {Array.from({ length: totalRounds }).map((_, i) => {
          const isCompleted = i < roundIndex + (phase === "round-result" || phase === "match-result" ? 1 : 0);
          return (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === roundIndex && phase === "playing"
                  ? "bg-cc-accent-blue animate-pulse scale-125"
                  : isCompleted
                  ? "bg-cc-green"
                  : "bg-cc-border"
              }`}
            />
          );
        })}
      </div>

      <div className="relative flex flex-col items-center gap-1 my-1">
        <div className="absolute inset-0 rounded-full blur-xl bg-cc-accent-gold/10 pointer-events-none" />
        <Swords className="w-7 h-7 text-cc-accent-gold drop-shadow-[0_0_8px_rgba(232,169,62,0.7)] animate-[battle-vs-pulse_2s_ease-in-out_infinite]" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-cc-accent-gold/70 font-serif">
          VS
        </span>
      </div>

      <div className="flex flex-col items-center gap-1 w-full">
        <div className="flex items-center justify-between w-full px-1">
          <span className="text-[10px] text-cc-accent-blue font-bold">You</span>
          <span className="text-[10px] text-cc-text-muted font-bold">Opp</span>
        </div>
        <div className="flex items-center gap-2 w-full justify-center">
          <span className="text-3xl font-black text-cc-accent-blue font-mono leading-none">
            {playerScore}
          </span>
          <span className="text-cc-text-muted font-bold text-sm">—</span>
          <span className="text-3xl font-black text-cc-accent-red font-mono leading-none">
            {opponentScore}
          </span>
        </div>
      </div>

      {phase === "playing" && (
        <div className="flex flex-col items-center gap-0.5 mt-1">
          <span className="text-[9px] uppercase tracking-widest text-cc-text-muted font-serif">
            Elapsed
          </span>
          <span className="text-sm font-mono font-bold text-cc-text-secondary">
            {timeSeconds}s
          </span>
        </div>
      )}
    </div>
  );
});
