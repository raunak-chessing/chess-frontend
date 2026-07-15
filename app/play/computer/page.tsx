"use client";

import { useRouter } from "next/navigation";
import { GameView } from "@/features/game";

export default function PlayComputerPage() {
  const router = useRouter();

  return (
    <GameView
      initialMode="computer-black"
      onReturnHome={() => router.push("/")}
    />
  );
}
