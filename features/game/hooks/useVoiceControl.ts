"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
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

function parseVoiceToSan(transcript: string): string {
  let text = transcript.toLowerCase().trim();

  // Common replacements for misheard words
  const map: Record<string, string> = {
    "night": "N",
    "knight": "N",
    "bishop": "B",
    "rook": "R",
    "queen": "Q",
    "king": "K",
    "takes": "x",
    "take": "x",
    "captures": "x",
    "capture": "x",
    "kills": "x",
    "kill": "x",
    "castle": "O-O",
    "castles": "O-O",
    "queenside": "O-O-O",
    "kingside": "O-O",
    "see": "c",
    "sea": "c",
    "bee": "b",
    "dee": "d",
    "ee": "e",
    "eff": "f",
    "gee": "g",
    "age": "h",
    "hey": "a",
    "to": "",
    "two": "2",
    "too": "2",
    "for": "4",
    "four": "4",
    "ate": "8",
    "eight": "8",
    "one": "1",
    "won": "1",
    "three": "3",
    "tree": "3",
    "five": "5",
    "six": "6",
    "seven": "7"
  };

  // Split into words, map them, and remove spaces
  let words = text.split(/\s+/);
  
  // Handle pawn moves simply: "e4", "d4"
  words = words.filter(w => w !== "pawn");

  let parsed = words.map(w => {
    if (/^[a-h][1-8]$/i.test(w)) return w;
    return map[w] !== undefined ? map[w] : w;
  }).join("");

  parsed = parsed.replace(/[^a-zA-Z0-9-Ox=+#]/g, "");

  if (parsed.length > 0) {
    if (["N", "B", "R", "Q", "K"].includes(parsed.charAt(0).toUpperCase())) {
      parsed = parsed.charAt(0).toUpperCase() + parsed.slice(1).toLowerCase();
    } else {
      parsed = parsed.toLowerCase();
    }
  }

  if (parsed === "o-o-o") return "O-O-O";
  if (parsed === "o-o") return "O-O";

  return parsed;
}

export function useVoiceControl(applyMove: (move: string | { from: string; to: string; promotion?: string }) => boolean) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

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
      
      const san = parseVoiceToSan(transcript);
      
      if (san) {
        const success = applyMove(san);
        if (!success) {
          toast.error(`Invalid move: ${transcript} -> ${san}`);
        } else {
          toast.success(`Move played: ${san}`);
        }
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
