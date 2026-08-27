"use client";

import { LeagueDivisions } from "@/features/factions/components";

export default function LeagueLeaderboardsPage() {
  return (
    <main className="min-h-screen bg-cc-bg-page flex items-start justify-center p-6 text-cc-text-primary">
      <div className="w-full max-w-4xl pt-8">
        <LeagueDivisions />
      </div>
    </main>
  );
}
