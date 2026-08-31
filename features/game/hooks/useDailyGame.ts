"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { gameApi, DailyGame } from "../api/gameApi";
import { useGameState } from "./useGameState";
import { toast } from "react-hot-toast";

/**
 * Fetch/mutate logic for a single daily game — polls for opponent moves,
 * validates turn order, and posts moves back to the server, reverting the
 * local board if the server rejects one. Extracted out of DailyGameView so
 * that component is purely presentational.
 */
export function useDailyGame(gameId: string, userId: string | undefined) {
  const gameState = useGameState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gameData, setGameData] = useState<DailyGame | null>(null);

  const setFenRef = useRef(gameState.setFen);
  useEffect(() => {
    setFenRef.current = gameState.setFen;
  }, [gameState.setFen]);

  const fetchGame = useCallback(async () => {
    try {
      const data = await gameApi.getDailyGame(gameId);
      setGameData(data);
      // We don't overwrite if the user just moved locally unless we want to reset.
      // But for initial load:
      setFenRef.current(data.fen);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
    // No polling, it's daily! But we can poll every 60s if we want.
    const interval = setInterval(fetchGame, 60000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  const handlePieceDrop = useCallback(
    (source: string, target: string): boolean => {
      if (!gameData || !userId) return false;
      const isWhite = gameData.whitePlayerId === userId;
      const isWhiteTurn = gameState.game.turn() === "w";

      if ((isWhite && !isWhiteTurn) || (!isWhite && isWhiteTurn)) {
        return false; // Not your turn
      }

      try {
        const moves = gameState.game.moves({ verbose: true });
        const isPromotion = moves.some((m: any) => m.from === source && m.to === target && m.promotion);

        if (isPromotion) {
          gameState.setPendingPromotion({ from: source, to: target });
          return false;
        }

        const move = gameState.game.move({ from: source, to: target });
        if (!move) return false;

        const nextFen = gameState.game.fen();
        gameState.setFen(nextFen);

        // Post move to backend
        gameApi
          .makeDailyMove(gameId, source, target)
          .then(() => fetchGame())
          .catch(() => {
            gameState.applyUndo();
            toast.error("Move rejected by server. Your move has been reverted.");
          });

        return true;
      } catch {
        return false;
      }
    },
    [gameState, gameData, userId, gameId, fetchGame],
  );

  const resolveDailyPromotion = useCallback(
    (piece: "q" | "r" | "b" | "n") => {
      if (!gameState.pendingPromotion) return;
      const { from, to } = gameState.pendingPromotion;

      try {
        const move = gameState.game.move({ from, to, promotion: piece });
        if (move) {
          const nextFen = gameState.game.fen();
          gameState.setFen(nextFen);

          gameApi
            .makeDailyMove(gameId, from, to)
            .then(() => fetchGame())
            .catch(() => {
              gameState.applyUndo();
              toast.error("Move rejected by server. Your move has been reverted.");
            });
        }
      } catch {
        // Ignore invalid moves
      }
      gameState.setPendingPromotion(null);
    },
    [gameState, gameId, fetchGame],
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      gameState.handleSquareClick(
        square,
        "pvp", // Hack to reuse local logic but override drop
        "",
        null,
        null,
      );
    },
    [gameState],
  );

  return {
    gameState,
    loading,
    error,
    gameData,
    handlePieceDrop,
    resolveDailyPromotion,
    handleSquareClick,
  };
}
