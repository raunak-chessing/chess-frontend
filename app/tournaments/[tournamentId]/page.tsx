"use client";

import { use, useEffect, useState } from "react";
import { ArenaLobby } from "@/features/tournaments/components/ArenaLobby";
import { SwissLobby } from "@/features/tournaments/components/SwissLobby";
import { tournamentsApi } from "@/features/tournaments/api/tournamentsApi";

export default function TournamentDetailPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = use(params);
  const [type, setType] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    tournamentsApi
      .getTournamentDetails(tournamentId)
      .then((data) => setType(data.type))
      .catch(() => setNotFound(true));
  }, [tournamentId]);

  if (notFound) {
    return <div className="p-8 text-center">Tournament not found</div>;
  }

  if (!type) {
    return <div className="p-8 text-center">Loading tournament...</div>;
  }

  if (type === "SWISS") {
    return <SwissLobby tournamentId={tournamentId} />;
  }

  return <ArenaLobby tournamentId={tournamentId} />;
}
