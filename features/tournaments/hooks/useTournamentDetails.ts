"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { tournamentsApi, Tournament, TournamentPlayer } from "../api/tournamentsApi";

const POLL_INTERVAL_MS = 5000;

export function useTournamentDetails(tournamentId: string, userId: string | undefined) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);

  const fetchTournament = useCallback(async () => {
    try {
      const data = await tournamentsApi.getTournamentDetails(tournamentId);
      setTournament(data);
      if (userId) {
        setIsJoined(data.players?.some((p: TournamentPlayer) => p.userId === userId) ?? false);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load tournament");
    } finally {
      setLoading(false);
    }
  }, [tournamentId, userId]);

  useEffect(() => {
    fetchTournament();
    const interval = setInterval(fetchTournament, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchTournament]);

  return { tournament, loading, isJoined, setIsJoined, refetch: fetchTournament };
}
