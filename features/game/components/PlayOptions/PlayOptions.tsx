import type { GameMode } from "../../types/game.types";

interface PlayOptionsProps {
  onSelectMode: (mode: GameMode) => void;
}

export default function PlayOptions({ onSelectMode }: PlayOptionsProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[380px] mt-4">
      <button
        onClick={() => onSelectMode("online")}
        className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl bg-[#81b64c] hover:bg-[#a3d16c] transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-white"
      >
        <span className="text-3xl">⚡</span>
        <div className="flex flex-col items-start text-left">
          <span className="text-lg font-bold leading-tight">Play Online</span>
          <span className="text-xs opacity-90 font-medium">
            Play vs someone at your level
          </span>
        </div>
      </button>

      <button
        onClick={() => onSelectMode("computer-black")}
        className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl bg-[#262421] hover:bg-[#32302d] border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-zinc-200"
      >
        <span className="text-3xl">💻</span>
        <div className="flex flex-col items-start text-left">
          <span className="text-lg font-bold leading-tight">
            Play with Computer
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            Play vs customizable training bots
          </span>
        </div>
      </button>

      <button
        onClick={() => onSelectMode("pvp")}
        className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl bg-[#262421] hover:bg-[#32302d] border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-zinc-200"
      >
        <span className="text-3xl">👥</span>
        <div className="flex flex-col items-start text-left">
          <span className="text-lg font-bold leading-tight">
            Play with a Friend
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            Play local PvP matches on one board
          </span>
        </div>
      </button>
    </div>
  );
}
