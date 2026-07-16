"use client";

import { useEffect } from "react";
import { Chess } from "chess.js";
import type { GameMode } from "../types/game.types";
import { COMPUTER_OPPONENTS } from "../constants/setupOptions";

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
    
    const bot = COMPUTER_OPPONENTS.find(b => b.id === botDifficulty);
    if (bot) {
      skillLevel = bot.skillLevel;
      depth = bot.depth;
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
          
          // Add artificial delay to simulate "thinking" and make it feel more human
          const delay = Math.random() * 1000 + 500; // 500ms to 1500ms
          setTimeout(() => {
            applyMove(from, to);
          }, delay);
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
