"use client";

import { useEffect } from "react";
import { Chess } from "chess.js";
import type { GameMode } from "../types/game.types";

interface UseChessEngineParams {
  game: Chess;
  fen: string;
  gameMode: GameMode;
  autoFlip: boolean;
  applyMove: (from: string, to: string) => boolean;
}

export function useChessEngine({
  game,
  fen,
  gameMode,
  applyMove,
}: UseChessEngineParams) {
  useEffect(() => {
    if (gameMode !== "computer-black" && gameMode !== "computer-white") return;
    if (game.isGameOver()) return;

    const currentTurn = game.turn();
    const isAiTurn =
      (gameMode === "computer-black" && currentTurn === "b") ||
      (gameMode === "computer-white" && currentTurn === "w");

    if (!isAiTurn) return;

    const worker = new Worker("/stockfish/stockfish-18-lite-single.js");

    worker.onmessage = (event: MessageEvent) => {
      const line = event.data;
      if (typeof line === "string" && line.startsWith("bestmove")) {
        const parts = line.split(" ");
        const bestMoveStr = parts[1];
        if (bestMoveStr && bestMoveStr !== "(none)") {
          const from = bestMoveStr.substring(0, 2);
          const to = bestMoveStr.substring(2, 4);
          applyMove(from, to);
        }
        worker.terminate();
      }
    };

    worker.postMessage("uci");
    worker.postMessage("isready");
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage("go depth 10");

    return () => {
      worker.terminate();
    };
  }, [fen, gameMode, game, applyMove]);
}
