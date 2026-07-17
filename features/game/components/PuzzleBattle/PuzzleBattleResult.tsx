"use client";

import { memo } from "react";
import { Trophy, RefreshCw, Home, Zap, Clock, ChevronRight } from "lucide-react";
import type { RoundRecord, MatchOutcome, RoundOutcome } from "../../hooks/usePuzzleBattle";

interface PuzzleBattleResultProps {
  type: "round" | "match";
  roundOutcome?: RoundOutcome;
  matchOutcome?: MatchOutcome;
  playerScore: number;
  opponentScore: number;
  roundHistory: RoundRecord[];
  opponentLabel: string;
  onNextRound: () => void;
  onRematch: () => void;
  onReturnHome: () => void;
}

function formatMs(ms: number): string {
  if (ms > 30000) return "—";
  return `${(ms / 1000).toFixed(2)}s`;
}

export const PuzzleBattleResult = memo(function PuzzleBattleResult({
  type,
  roundOutcome,
  matchOutcome,
  playerScore,
  opponentScore,
  roundHistory,
  opponentLabel,
  onNextRound,
  onRematch,
  onReturnHome,
}: PuzzleBattleResultProps) {
  const isMatchResult = type === "match";
  const playerWon = isMatchResult ? matchOutcome === "player" : roundOutcome === "player";

  const headlineText = isMatchResult
    ? playerWon
      ? "Victory! 🏆"
      : "Defeated 💀"
    : roundOutcome === "player"
    ? "Round Won! ⚡"
    : "Opponent Wins 😤";

  const subText = isMatchResult
    ? playerWon
      ? `You dominated ${opponentLabel} ${playerScore}–${opponentScore}`
      : `${opponentLabel} wins ${opponentScore}–${playerScore}`
    : roundOutcome === "player"
    ? "You solved it first!"
    : `${opponentLabel} was faster`;

  const headlineColor = playerWon ? "text-cc-green" : "text-cc-accent-red";
  const glowClass = playerWon
    ? "shadow-[0_0_60px_rgba(129,182,76,0.3)]"
    : "shadow-[0_0_60px_rgba(204,51,51,0.3)]";

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center bg-cc-bg-page/92 backdrop-blur-md rounded-3xl ${glowClass} animate-[battle-result-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)_both]`}
    >
      <div className="flex flex-col items-center gap-6 text-center px-6 max-w-md w-full">
        <div className="flex flex-col items-center gap-2">
          <span
            className={`text-4xl md:text-5xl font-black font-serif tracking-tight animate-[battle-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both] ${headlineColor}`}
          >
            {headlineText}
          </span>
          <span className="text-cc-text-secondary text-sm font-medium">{subText}</span>
        </div>

        {isMatchResult && (
          <div className="flex items-center gap-8 bg-cc-bg-card border border-cc-border rounded-2xl px-8 py-4 shadow-lg w-full justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-black text-cc-accent-blue font-mono">{playerScore}</span>
              <span className="text-[10px] uppercase tracking-widest text-cc-text-muted font-bold">You</span>
            </div>
            <span className="text-cc-text-muted font-bold text-xl">—</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-black text-cc-accent-red font-mono">{opponentScore}</span>
              <span className="text-[10px] uppercase tracking-widest text-cc-text-muted font-bold">Opp</span>
            </div>
          </div>
        )}

        {isMatchResult && roundHistory.length > 0 && (
          <div className="w-full bg-cc-bg-card border border-cc-border rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-cc-bg-sidebar border-b border-cc-border">
              <span className="text-[10px] uppercase tracking-widest font-bold text-cc-text-muted">Round Summary</span>
            </div>
            <div className="divide-y divide-cc-border">
              {roundHistory.map((record, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-bold text-cc-text-muted">R{i + 1}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        record.winner === "player"
                          ? "bg-cc-green/15 text-cc-green"
                          : "bg-cc-accent-red/15 text-cc-accent-red"
                      }`}
                    >
                      {record.winner === "player" ? "You won" : "Opp won"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-cc-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      You: {formatMs(record.playerTimeMs)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Opp: {formatMs(record.opponentTimeMs)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5 w-full">
          {!isMatchResult ? (
            <button
              id="battle-next-round-btn"
              onClick={onNextRound}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cc-green hover:bg-cc-green-hover text-white font-bold text-sm transition-all active:scale-95 shadow-lg cursor-pointer"
            >
              Next Round <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                id="battle-rematch-btn"
                onClick={onRematch}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cc-green hover:bg-cc-green-hover text-white font-bold text-sm transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Rematch
              </button>
              <button
                id="battle-home-btn"
                onClick={onReturnHome}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cc-bg-sidebar border border-cc-border-light text-cc-text-secondary hover:text-cc-text-primary hover:border-cc-border font-bold text-sm transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Back to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
