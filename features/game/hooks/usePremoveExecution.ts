"use client";

import { useEffect } from "react";
import type { GameMode } from "../types/game.types";
import type { UseGameStateReturn } from "./useGameState";
import type { UseGameSocketReturn } from "./useGameSocket";

export function usePremoveExecution(
  gameState: UseGameStateReturn,
  gameMode: GameMode,
  socketState: UseGameSocketReturn,
) {
  useEffect(() => {
    const isTurn =
      (gameMode === "online" && socketState.playerColor === gameState.turn) ||
      (gameMode === "computer-black" && gameState.turn === "w") ||
      (gameMode === "computer-white" && gameState.turn === "b") ||
      gameMode === "pvp";

    if (isTurn && gameState.premoveQueue.length > 0 && !gameState.game.isGameOver()) {
      const pm = gameState.premoveQueue[0];
      const success = gameState.handlePieceDrop(
        pm.from,
        pm.to,
        gameMode,
        socketState.joinedRoom,
        socketState.playerColor,
        socketState.socket,
      );
      if (!success) {
        gameState.clearPremoves();
      }
    }
  }, [
    gameState.turn,
    gameState.premoveQueue,
    gameMode,
    socketState.playerColor,
    socketState.joinedRoom,
    socketState.socket,
    gameState,
  ]);
}
