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
  botDifficulty?: number;
}

export function useChessEngine({
  game,
  fen,
  gameMode,
  applyMove,
  botDifficulty = 3,
}: UseChessEngineParams) {
  useEffect(() => {
    if (gameMode !== "computer-black" && gameMode !== "computer-white") return;
    if (game.isGameOver()) return;

    const currentTurn = game.turn();
    const isAiTurn =
      (gameMode === "computer-black" && currentTurn === "b") ||
      (gameMode === "computer-white" && currentTurn === "w");

    if (!isAiTurn) return;

    let skillLevel = 12;
    let depth = 8;

    if (botDifficulty === 1) {
      skillLevel = 0;
      depth = 1;
    } else if (botDifficulty === 2) {
      skillLevel = 5;
      depth = 3;
    } else if (botDifficulty === 3) {
      skillLevel = 12;
      depth = 8;
    } else if (botDifficulty === 4) {
      skillLevel = 20;
      depth = 15;
    }

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
    worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
    worker.postMessage("isready");
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${depth}`);

    return () => {
      worker.terminate();
    };
  }, [fen, gameMode, game, applyMove, botDifficulty]);
}
