"use client";

import { useRouter } from "next/navigation";
import { GameView } from "@/features/game";

export default function PlayOnlinePage() {
  const router = useRouter();

  return (
    <GameView
      initialMode="online"
      onReturnHome={() => router.push("/")}
    />
  );
}
