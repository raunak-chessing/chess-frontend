"use client";

import { use } from "react";
import DailyGameView from "@/features/game/components/DailyGameView";

export default function PlayDailyGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const resolvedParams = use(params);
  return <DailyGameView gameId={resolvedParams.gameId} />;
}
