"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { Chess } from "chess.js";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
  }
}

// Levenshtein distance for fuzzy string matching
function levenshteinDistance(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function normalizeTranscript(text: string): string {
  let lower = text.toLowerCase().trim();
  // Basic phonetic mapping before fuzzy match
  const map: Record<string, string> = {
    "night": "n", "knight": "n", "bishop": "b", "rook": "r", "queen": "q", "king": "k",
    "takes": "x", "take": "x", "capture": "x",
    "castle": "o-o", "queenside": "o-o-o", "kingside": "o-o",
    "see": "c", "sea": "c", "bee": "b", "dee": "d", "ee": "e", "eff": "f", "gee": "g", "age": "h", "hey": "a",
    "one": "1", "won": "1", "two": "2", "too": "2", "to": "2", "three": "3", "tree": "3",
    "four": "4", "for": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "ate": "8"
  };
  
  const words = lower.split(/\s+/).filter(w => w !== "pawn");
  let normalized = words.map(w => map[w] !== undefined ? map[w] : w).join("");
  return normalized.replace(/[^a-z0-9ox-]/g, "");
}

function findBestMoveMatch(transcript: string, fen: string): string | null {
  try {
    const chess = new Chess(fen);
    const legalMoves = chess.moves(); // returns array of SAN strings
    
    const normalized = normalizeTranscript(transcript);
    if (!normalized) return null;

    let bestMatch = null;
    let minDistance = Infinity;

    for (const move of legalMoves) {
      // Normalize the legal move for comparison (lowercase, remove +, #)
      const moveNorm = move.toLowerCase().replace(/[+#]/g, "");
      const distance = levenshteinDistance(normalized, moveNorm);
      
      // If exact match after normalization, return immediately
      if (distance === 0) return move;
      
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = move;
      }
    }

    // Threshold for acceptable fuzzy match (max 2 characters off)
    if (minDistance <= 2 && bestMatch) {
      return bestMatch;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

export function useVoiceControl(
  fen: string,
  applyMove: (move: string | { from: string; to: string; promotion?: string }) => boolean
) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // We need to keep the latest fen in a ref so the callback always uses the current state
  const fenRef = useRef(fen);
  useEffect(() => {
    fenRef.current = fen;
  }, [fen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = false; 
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      
      const bestMove = findBestMoveMatch(transcript, fenRef.current);
      
      if (bestMove) {
        const success = applyMove(bestMove);
        if (!success) {
          toast.error(`Invalid move: ${transcript} -> ${bestMove}`);
        } else {
          toast.success(`Voice Move: ${bestMove}`);
        }
      } else {
        toast.error(`Could not understand move: ${transcript}`);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return;
      setIsListening(false);
      toast.error(`Voice error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [applyMove]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error("Speech Recognition not supported in this browser (Use Chrome or Edge).");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        toast.error("Failed to start voice recognition.");
      }
    }
  }, [isListening]);

  return {
    isListening,
    toggleListening
  };
}
