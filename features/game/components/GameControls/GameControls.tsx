import { memo } from "react";
import type { GameMode } from "../../types/game.types";
import { OnlineMatchmaker } from "../OnlineMatchmaker";

interface GameControlsProps {
  gameMode: GameMode;
  autoFlip: boolean;
  flipped: boolean;
  hasHistory: boolean;
  joinedRoom: string;
  playerColor: "w" | "b" | null;
  inQueue: boolean;
  userRating: number;
  roomCode: string;
  isGameOver: boolean;
  onGameModeChange: (mode: GameMode) => void;
  onAutoFlipToggle: (checked: boolean) => void;
  onFlipBoard: () => void;
  onUndo: () => void;
  onReset: () => void;
  onReturnHome: () => void;
  onUserRatingChange: (rating: number) => void;
  onRoomCodeChange: (code: string) => void;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onJoinRoom: () => void;
  onResign: () => void;
}

const GameControls = memo(function GameControls({
  gameMode,
  autoFlip,
  hasHistory,
  joinedRoom,
  playerColor,
  inQueue,
  userRating,
  roomCode,
  isGameOver,
  onGameModeChange,
  onAutoFlipToggle,
  onFlipBoard,
  onUndo,
  onReset,
  onReturnHome,
  onUserRatingChange,
  onRoomCodeChange,
  onJoinQueue,
  onLeaveQueue,
  onJoinRoom,
  onResign,
}: GameControlsProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={onReturnHome}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer text-zinc-200"
        >
          🏠 Return to Home
        </button>
      </div>

      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
        Settings &amp; Controls
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-slate-500 font-semibold">
            Game Mode
          </span>
          {hasHistory ? (
            <div className="w-full px-4 py-2.5 text-sm bg-slate-950/40 text-zinc-300 border border-slate-850/60 rounded-xl font-semibold flex items-center justify-between">
              <span>
                {gameMode === "pvp" && "Player vs Player"}
                {gameMode === "computer-black" && "Play as White (vs Computer)"}
                {gameMode === "computer-white" && "Play as Black (vs Computer)"}
                {gameMode === "online" && "Multiplayer Online"}
              </span>
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/30 animate-pulse">
                Active
              </span>
            </div>
          ) : (
            <select
              value={gameMode}
              onChange={(e) => onGameModeChange(e.target.value as GameMode)}
              className="w-full pl-3 pr-9 py-2.5 text-sm bg-slate-950/40 text-zinc-200 border border-slate-850 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23a3a3a0%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_12px_center] bg-[size:16px] bg-no-repeat transition-all"
            >
              <option value="pvp" className="bg-slate-900 text-zinc-200">
                Player vs Player
              </option>
              <option
                value="computer-black"
                className="bg-slate-900 text-zinc-200"
              >
                Play as White (vs Computer)
              </option>
              <option
                value="computer-white"
                className="bg-slate-900 text-zinc-200"
              >
                Play as Black (vs Computer)
              </option>
              <option value="online" className="bg-slate-900 text-zinc-200">
                Multiplayer Online
              </option>
            </select>
          )}
        </div>

        {gameMode === "online" && (
          <OnlineMatchmaker
            joinedRoom={joinedRoom}
            playerColor={playerColor}
            inQueue={inQueue}
            userRating={userRating}
            roomCode={roomCode}
            onUserRatingChange={onUserRatingChange}
            onRoomCodeChange={onRoomCodeChange}
            onJoinQueue={onJoinQueue}
            onLeaveQueue={onLeaveQueue}
            onJoinRoom={onJoinRoom}
          />
        )}

        <label className="flex items-center gap-3 text-sm font-semibold text-zinc-300 cursor-pointer hover:text-zinc-150 transition-colors bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 mt-2">
          <input
            type="checkbox"
            checked={autoFlip}
            onChange={(e) => onAutoFlipToggle(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
          />
          Auto-Flip Board on Turn
        </label>

        <div className="flex flex-col gap-2 mt-2">
          {hasHistory && !isGameOver && (
            <button
              onClick={onResign}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/60 hover:border-red-700 transition-all cursor-pointer text-red-200"
            >
              🏳️ Give Up / Resign
            </button>
          )}
          <button
            onClick={onUndo}
            disabled={!hasHistory}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-98 border border-slate-700 hover:border-slate-650 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
          >
            ↩️ Undo Move
          </button>
          <button
            onClick={onFlipBoard}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-98 border border-slate-700 hover:border-slate-650 transition-all cursor-pointer text-zinc-200"
          >
            🔄 Flip Board
          </button>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-550 active:scale-98 text-white transition-all cursor-pointer shadow-md shadow-emerald-950/20"
          >
            🆕 Reset Match
          </button>
        </div>
      </div>
    </div>
  );
});

export default GameControls;
