"use client";

import { useEffect, useState, useRef } from "react";

interface EvaluationBarProps {
  fen: string;
  turn: "w" | "b";
  isGameOver: boolean;
}

export function EvaluationBar({ fen, turn, isGameOver }: EvaluationBarProps) {
  const [evaluation, setEvaluation] = useState<number>(0);
  const [isMate, setIsMate] = useState<boolean>(false);
  const [mateMoves, setMateMoves] = useState<number>(0);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker("/stockfish/stockfish-18-lite-single.js");
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const line = e.data;
      if (typeof line !== "string") return;

      if (line.includes("score cp")) {
        const match = line.match(/score cp (-?\d+)/);
        if (match) {
          const cp = parseInt(match[1]);
          setEvaluation(cp / 100);
          setIsMate(false);
        }
      } else if (line.includes("score mate")) {
        const match = line.match(/score mate (-?\d+)/);
        if (match) {
          const mate = parseInt(match[1]);
          setIsMate(true);
          setMateMoves(mate);
        }
      }
    };

    worker.postMessage("uci");
    worker.postMessage("isready");

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (isGameOver) return;
    const worker = workerRef.current;
    if (worker) {
      worker.postMessage("stop");
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage("go depth 8");
    }
  }, [fen, isGameOver]);

  const getPercentage = () => {
    if (isMate) {
      return mateMoves > 0 ? 100 : 0;
    }
    const val = evaluation;
    const clamped = Math.max(-5, Math.min(5, val));
    return ((clamped + 5) / 10) * 100;
  };

  const getLabel = () => {
    if (isMate) {
      return `M${Math.abs(mateMoves)}`;
    }
    const absVal = Math.abs(evaluation).toFixed(1);
    if (evaluation === 0) return "0.0";
    return evaluation > 0 ? `+${absVal}` : `-${absVal}`;
  };

  const whitePct = getPercentage();

  return (
    <div className="w-6 md:w-8 h-full bg-cc-bg-input rounded-lg overflow-hidden flex flex-col-reverse relative border border-cc-border-dark shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
      <div
        className="bg-zinc-100 w-full transition-all duration-500 ease-out"
        style={{ height: `${whitePct}%` }}
      />
      <span
        className={`absolute left-0 right-0 text-center font-bold text-[9px] md:text-[10px] select-none z-10 ${
          whitePct > 50 ? "bottom-2 text-cc-bg-page" : "top-2 text-zinc-100"
        }`}
      >
        {getLabel()}
      </span>
    </div>
  );
}
