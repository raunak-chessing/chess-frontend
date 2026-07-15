import { memo, useState } from "react";
import type { GameMode } from "../../types/game.types";

interface GameControlsProps {
  gameMode: GameMode;
  autoFlip: boolean;
  flipped: boolean;
  hasHistory: boolean;
  joinedRoom: string;
  playerColor: "w" | "b" | null;
  isGameOver: boolean;
  viewMode: "3d" | "2.5d" | "2d";
  onViewModeChange: (mode: "3d" | "2.5d" | "2d") => void;
  onAutoFlipToggle: (checked: boolean) => void;
  onFlipBoard: () => void;
  onUndo: () => void;
  onReset: () => void;
  onReturnHome: () => void;
  onResign: () => void;
}

const GameControls = memo(function GameControls({
  gameMode,
  autoFlip,
  hasHistory,
  joinedRoom,
  isGameOver,
  viewMode,
  onViewModeChange,
  onAutoFlipToggle,
  onFlipBoard,
  onUndo,
  onReset,
  onReturnHome,
  onResign,
}: GameControlsProps) {
  const [showOptionsPopover, setShowOptionsPopover] = useState(false);

    const btnClass = (active: boolean) =>
      `w-14 h-14 rounded-xl font-extrabold text-sm flex items-center justify-center border transition-all duration-300 shadow-[0_4px_0_var(--cc-bg-hover)] cursor-pointer select-none ${
        active
          ? "scale-105 bg-[var(--cc-green)] border-[var(--cc-green-dark)] text-[var(--cc-bg-page)] shadow-[0_4px_0_var(--cc-green-dark)]"
          : "active:scale-95 bg-[var(--cc-bg-input)] border-[var(--cc-border)] text-[var(--cc-text-secondary)]"
      }`;

  return (
    <div className="relative flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-3 border p-3 rounded-2xl shadow-xl bg-cc-bg-card border-cc-border">
        <button
          onClick={() => onViewModeChange("3d")}
          className={btnClass(viewMode === "3d")}
        >
          3D
        </button>

        <button
          onClick={() => onViewModeChange("2.5d")}
          className={btnClass(viewMode === "2.5d")}
        >
          2.5D
        </button>

        <button
          onClick={() => onViewModeChange("2d")}
          className={btnClass(viewMode === "2d")}
        >
          2D
        </button>

        <div className="w-8 border-b my-1 border-cc-border" />

        <button
          onClick={onFlipBoard}
          title="Flip Board"
          className={btnClass(false)}
        >
          🔄
        </button>

        <button
          onClick={() => setShowOptionsPopover((prev) => !prev)}
          title="Options"
          className={`${btnClass(showOptionsPopover)} text-2xl`}
        >
          •••
        </button>

        <button
          onClick={onReturnHome}
          title="Return Home"
          className="w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 border bg-cc-bg-input hover:bg-red-800 border-cc-border shadow-[0_4px_0_var(--cc-bg-hover)] text-xl"
        >
          🏠
        </button>
      </div>

      {showOptionsPopover && (
        <div className="absolute right-20 top-0 w-80 border p-5 rounded-2xl shadow-2xl z-40 animate-fade-in flex flex-col gap-4 bg-cc-bg-card border-cc-border">
          <div className="flex justify-between items-center border-b pb-2 border-cc-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cc-text-primary">
              Game Settings
            </h3>
            <button
              onClick={() => setShowOptionsPopover(false)}
              className="opacity-65 hover:opacity-100 text-xs font-bold cursor-pointer text-cc-text-primary"
            >
              Close ✕
            </button>
          </div>

          <div className="flex flex-col gap-3.5 text-cc-text-secondary">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cc-text-secondary">
                Game Mode
              </span>
              <div className="w-full px-3 py-2.5 text-xs border rounded-xl font-semibold flex items-center justify-between bg-cc-bg-sidebar text-cc-text-primary border-cc-border">
                <span>
                  {gameMode === "pvp" && "Player vs Player"}
                  {gameMode === "computer-black" && "Play as White (vs Computer)"}
                  {gameMode === "computer-white" && "Play as Black (vs Computer)"}
                  {gameMode === "online" && "Multiplayer Online"}
                </span>
                <span className="text-cc-green text-[9px] uppercase font-bold tracking-wider bg-cc-green/10 px-1.5 py-0.5 rounded border border-cc-green/30">
                  Active
                </span>
              </div>
            </div>

            <div className="border-t pt-3 flex flex-col gap-3 border-cc-border">
              <label className="flex items-center gap-3 text-xs font-semibold cursor-pointer transition-colors p-2.5 rounded-xl border select-none bg-cc-bg-input border-cc-border text-cc-text-primary hover:bg-cc-bg-hover">
                <input
                  type="checkbox"
                  checked={autoFlip}
                  onChange={(e) => onAutoFlipToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                Auto-Flip Board on Turn
              </label>

              {hasHistory && !isGameOver && (
                <button
                  onClick={() => {
                    onResign();
                    setShowOptionsPopover(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/60 hover:border-red-700 transition-all text-red-200 cursor-pointer"
                >
                  🏳️ Give Up / Resign
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onUndo();
                    setShowOptionsPopover(false);
                  }}
                  disabled={!hasHistory}
                  className="flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer bg-cc-bg-input border-cc-border text-cc-text-primary hover:bg-cc-bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ↩️ Undo Move
                </button>

                <button
                  onClick={() => {
                    onReset();
                    setShowOptionsPopover(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold rounded-xl text-white transition-all cursor-pointer shadow-[0_4px_0_var(--cc-green-dark)] active:shadow-none active:translate-y-[4px] bg-cc-green hover:bg-cc-green-hover"
                >
                  🆕 Reset Match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default GameControls;
