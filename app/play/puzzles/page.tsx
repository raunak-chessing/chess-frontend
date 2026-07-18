"use client";

import { useRouter } from "next/navigation";
import GameView from "@/features/game/components/GameView/GameView";

export default function PlayPuzzlesPage() {
  const router = useRouter();

  return (
    <GameView
      initialMode="puzzle-rush"
      onReturnHome={() => router.push("/")}
    />
  );
}
