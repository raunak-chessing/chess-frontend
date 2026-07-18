"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { GameView } from "@/features/game";
import { Spinner } from "@/components/ui/Spinner";

export default function PlayOnlinePage() {
  const router = useRouter();

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner /></div>}>
      <GameView
        initialMode="online"
        onReturnHome={() => router.push("/")}
      />
    </Suspense>
  );
}
