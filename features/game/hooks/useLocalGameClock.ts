"use client";

import { useState, useEffect, useCallback } from "react";
import type { Chess } from "chess.js";
import type { GameMode } from "../types/game.types";

/**
 * The local (non-server-authoritative) chess clock used for offline/bot/local
 * PvP games — ticks down whichever side's turn it is, and reports a loss on
 * timeout. Online games use the server-synced clock (useServerClock) instead;
 * this hook simply no-ops while gameMode === "online".
 */
export function useLocalGameClock(
  game: Chess,
  fen: string,
  gameMode: GameMode,
  localResult: string | null,
  onTimeout: (result: "won" | "lost") => void,
  localTimeControl: string,
) {
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  const resetTimers = useCallback(() => {
    if (localTimeControl === "unlimited") {
      setWhiteTime(999999);
      setBlackTime(999999);
    } else {
      const mins = parseInt(localTimeControl.split("|")[0]) || 10;
      setWhiteTime(mins * 60);
      setBlackTime(mins * 60);
    }
  }, [localTimeControl]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const isGameOver = game.isGameOver() || localResult !== null;
    const hasHistory = game.history().length > 0;

    if (hasHistory && !isGameOver && gameMode !== "online") {
      interval = setInterval(() => {
        const turn = game.turn();
        if (turn === "w") {
          setWhiteTime((prev) => {
            if (prev <= 1) {
              onTimeout("lost");
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 1) {
              onTimeout("won");
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, game, gameMode, localResult]);

  return { whiteTime, blackTime, resetTimers };
}
