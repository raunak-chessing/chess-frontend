"use client";

import { useRouter } from "next/navigation";
import { PlayOptions } from "@/features/game";
import type { GameMode } from "@/features/game/types/game.types";

export default function PlayMenuPage() {
  const router = useRouter();

  const handleSelectMode = (mode: GameMode) => {
    if (mode === "online") {
      router.push("/play/online");
    } else if (mode === "computer-black" || mode === "computer-white") {
      router.push("/play/computer");
    } else if (mode === "pvp") {
      router.push("/play/local");
    } else if (mode === "puzzle-rush") {
      router.push("/play/puzzles");
    }
  };

  return (
    <main className="min-h-screen bg-cc-bg-page flex flex-col items-center justify-center p-6 text-cc-text-primary">
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <h1 className="text-3xl font-extrabold font-sans tracking-tight mb-2">
          Play Chess
        </h1>
        <p className="text-sm text-cc-text-secondary font-medium mb-6 text-center">
          Choose a mode to start playing
        </p>
        <PlayOptions onSelectMode={handleSelectMode} />
      </div>
    </main>
  );
}
