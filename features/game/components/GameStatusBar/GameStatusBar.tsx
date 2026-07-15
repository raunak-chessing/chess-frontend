import { memo } from "react";
import type { GameMode } from "../../types/game.types";

interface GameStatusBarProps {
  turn: "w" | "b";
  isCheckmate: boolean;
  isDraw: boolean;
  inCheck: boolean;
  gameMode: GameMode;
  joinedRoom: string;
  inQueue: boolean;
  userRating: number;
}

const GameStatusBar = memo(function GameStatusBar({
  turn,
  isCheckmate,
  isDraw,
  inCheck,
  gameMode,
  joinedRoom,
  inQueue,
  userRating,
}: GameStatusBarProps) {
  const getStatusText = (): string => {
    if (gameMode === "online" && !joinedRoom) {
      if (inQueue) {
        return `Searching for opponent (Elo ${userRating})...`;
      }
      return "Waiting to search...";
    }
    if (isCheckmate) {
      return `Checkmate! ${turn === "w" ? "Black" : "White"} wins.`;
    }
    if (isDraw) {
      return "Game Drawn!";
    }
    if (inCheck) {
      return `${turn === "w" ? "White" : "Black"}'s Turn - CHECK!`;
    }
    return `${turn === "w" ? "White" : "Black"}'s Turn`;
  };

  return (
    <div className="flex-1 max-w-sm h-12 flex items-center justify-center rounded-xl border px-4 mx-3 bg-cc-bg-card border-cc-border">
      <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-center text-cc-text-primary">
        {getStatusText()}
      </span>
    </div>
  );
});

export default GameStatusBar;
