"use client";

import { useRouter } from "next/navigation";
import { PuzzleBattle } from "@/features/game/components/PuzzleBattle/PuzzleBattle";

export default function BattlePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-cc-bg-page flex flex-col items-center justify-start py-6 px-4">
      <PuzzleBattle onReturnHome={() => router.push("/")} />
    </main>
  );
}
