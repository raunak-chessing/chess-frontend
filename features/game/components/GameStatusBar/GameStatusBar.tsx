import { memo } from "react";
import type { GameMode } from "../../types/game.types";

interface GameStatusBarProps {
  turn: "w" | "b";
  isGameOver: boolean;
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
  isGameOver,
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
        return `Searching for a compatible opponent (Elo ${userRating})...`;
      }
      return "Waiting to join or start search...";
    }
    if (isCheckmate) {
      return `Checkmate! ${turn === "w" ? "Black" : "White"} wins.`;
    }
    if (isDraw) {
      return "Draw! Game over.";
    }
    if (inCheck) {
      return `${turn === "w" ? "White" : "Black"}'s Turn - CHECK!`;
    }
    return `${turn === "w" ? "White" : "Black"}'s Turn`;
  };

  const showPulse =
    !isGameOver && !(gameMode === "online" && !joinedRoom);

  return (
    <div className="w-full flex items-center justify-between mb-4 px-1 max-w-[692px]">
      <div className="flex items-center gap-2">
        <span
          className={`w-3.5 h-3.5 rounded-full ${
            turn === "w"
              ? "bg-white border border-zinc-400"
              : "bg-black border border-zinc-700"
          } ${showPulse ? "animate-pulse" : ""}`}
        />
        <span className="text-sm font-semibold tracking-wide text-zinc-300">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
});

export default GameStatusBar;
