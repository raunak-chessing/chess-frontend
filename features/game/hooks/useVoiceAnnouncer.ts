"use client";

import { useEffect, useRef } from "react";

export function useVoiceAnnouncer(
  historyLength: number,
  lastMoveSan: string | null,
  isOpponentMove: boolean,
  isBlindfold: boolean
) {
  const prevHistoryLength = useRef(historyLength);

  useEffect(() => {
    // Only announce if a new move was added
    if (historyLength > prevHistoryLength.current) {
      if (isOpponentMove && lastMoveSan) {
        // Expand SAN for better TTS reading
        let text = lastMoveSan;
        text = text.replace("N", "Knight ");
        text = text.replace("B", "Bishop ");
        text = text.replace("R", "Rook ");
        text = text.replace("Q", "Queen ");
        text = text.replace("K", "King ");
        text = text.replace("x", "takes ");
        text = text.replace("+", " check");
        text = text.replace("#", " checkmate");
        text = text.replace("O-O-O", "Castles queenside");
        text = text.replace("O-O", "Castles kingside");
        text = text.replace("=", " promotes to ");

        // Speak the move
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 1.1; // Slightly faster
          window.speechSynthesis.speak(utterance);
        }
      }
    }
    prevHistoryLength.current = historyLength;
  }, [historyLength, lastMoveSan, isOpponentMove, isBlindfold]);
}
