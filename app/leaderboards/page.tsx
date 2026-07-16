"use client";

import { Leaderboards } from "@/features/social/components/Leaderboards";

export default function LeaderboardsPage() {
  return (
    <main className="min-h-screen bg-cc-bg-page flex items-start justify-center p-6 text-cc-text-primary">
      <div className="w-full max-w-4xl pt-8">
        <Leaderboards />
      </div>
    </main>
  );
}
