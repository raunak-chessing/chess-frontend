"use client";

import { useRouter } from "next/navigation";
import { PuzzleRush } from "../../../features/game/components/PuzzleRush/PuzzleRush";

export default function PuzzleRushPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 h-full overflow-y-auto">
      <PuzzleRush onReturnHome={() => router.push("/puzzles")} />
    </div>
  );
}
