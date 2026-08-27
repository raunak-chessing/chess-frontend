"use client";

import { useState, useEffect, useRef } from "react";
import { lichessApi } from "../../../lib/lichessApi";

export function useOpeningName(fen: string, moveCount: number): string | null {
  const [openingName, setOpeningName] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (moveCount > 15) return;

    const id = ++requestId.current;
    const fetchOpening = async () => {
      try {
        const name = await lichessApi.getOpeningName(fen);
        if (name && id === requestId.current) {
          setOpeningName(name);
        }
      } catch (e) {
        // silently ignore
      }
    };

    const timer = setTimeout(fetchOpening, 500);
    return () => clearTimeout(timer);
  }, [fen, moveCount]);

  return openingName;
}
