"use client";

import { useRouter } from "next/navigation";
import { GameView } from "@/features/game";

export default function PlayLocalPage() {
  const router = useRouter();

  return (
    <GameView
      initialMode="pvp"
      onReturnHome={() => router.push("/")}
    />
  );
}
