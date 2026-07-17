"use client";

import { memo, useEffect, useRef, useState, useCallback } from "react";
import { Chess } from "chess.js";
import { Board } from "@/features/game/components/Board";
import { Drill } from "../../constants/drills";
import Link from "next/link";

interface DrillSolverProps {
  drill: Drill;
}

export const DrillSolver = memo(function DrillSolver({ drill }: DrillSolverProps) {
  const [boardPosition, setBoardPosition] = useState(drill.fen);
  const [statusMessage, setStatusMessage] = useState("Your turn! Play against the engine.");
  const [statusColor, setStatusColor] = useState("text-cc-text-primary");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);

  const [localChess, setLocalChess] = useState<Chess>(() => new Chess(drill.fen));
  const engineWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Reset state when drill changes
    setBoardPosition(drill.fen);
    setLocalChess(new Chess(drill.fen));
    setStatusMessage("Your turn! Play against the engine.");
    setStatusColor("text-cc-text-primary");
    setIsGameOver(false);
    setGameResult(null);

    // Initialize engine
    if (engineWorkerRef.current) {
      engineWorkerRef.current.terminate();
    }
    const worker = new Worker("/stockfish.js");
    engineWorkerRef.current = worker;
    
    // If it's not the user's turn initially, let engine play first
    const currentTurn = new Chess(drill.fen).turn();
    if (currentTurn !== drill.playerColor) {
      triggerEngineMove(new Chess(drill.fen));
    }

    return () => {
      if (engineWorkerRef.current) {
        engineWorkerRef.current.terminate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drill]);

  const triggerEngineMove = useCallback((chessInstance: Chess) => {
    setStatusMessage("Engine is thinking...");
    setStatusColor("text-zinc-400");
    const worker = engineWorkerRef.current;
    if (!worker) return;

    worker.postMessage("uci");
    worker.postMessage(`position fen ${chessInstance.fen()}`);
    worker.postMessage("go depth 10");

    worker.onmessage = (e) => {
      const line = e.data;
      if (line.startsWith("bestmove")) {
        const bestMove = line.split(" ")[1];
        if (bestMove && bestMove !== "(none)") {
          const fromSq = bestMove.slice(0, 2);
          const toSq = bestMove.slice(2, 4);
          const promo = bestMove.length > 4 ? bestMove[4] : "q";
          
          try {
            const move = chessInstance.move({ from: fromSq, to: toSq, promotion: promo });
            if (move) {
              setBoardPosition(chessInstance.fen());
              new Audio("/sounds/capture.mp3").play().catch(() => {});
              
              if (chessInstance.isGameOver()) {
                setIsGameOver(true);
                if (chessInstance.isCheckmate()) {
                  setStatusMessage("Checkmate! You lost.");
                  setStatusColor("text-red-500 font-bold");
                  setGameResult("Loss");
                } else {
                  setStatusMessage("Draw.");
                  setStatusColor("text-amber-500 font-bold");
                  setGameResult("Draw");
                }
              } else {
                setStatusMessage("Your turn!");
                setStatusColor("text-cc-text-primary");
              }
            }
          } catch {
             setStatusMessage("Engine made an invalid move.");
          }
        }
      }
    };
  }, []);

  const handlePieceDrop = useCallback((source: string, target: string): boolean => {
    if (isGameOver) return false;
    
    if (localChess.turn() !== drill.playerColor) {
      return false; // Not your turn
    }

    try {
      const move = localChess.move({ from: source, to: target, promotion: "q" });
      if (move) {
        setBoardPosition(localChess.fen());
        new Audio("/sounds/move.mp3").play().catch(() => {});

        if (localChess.isGameOver()) {
          setIsGameOver(true);
          if (localChess.isCheckmate()) {
            setStatusMessage("Checkmate! You won!");
            setStatusColor("text-cc-green font-bold");
            setGameResult("Win");
          } else {
            setStatusMessage("Draw.");
            setStatusColor("text-amber-500 font-bold");
            setGameResult("Draw");
          }
        } else {
          // Let engine play
          triggerEngineMove(localChess);
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [localChess, isGameOver, drill.playerColor, triggerEngineMove]);

  const handleRestart = () => {
    setBoardPosition(drill.fen);
    const newChess = new Chess(drill.fen);
    setLocalChess(newChess);
    setStatusMessage("Your turn! Play against the engine.");
    setStatusColor("text-cc-text-primary");
    setIsGameOver(false);
    setGameResult(null);

    if (newChess.turn() !== drill.playerColor) {
      triggerEngineMove(newChess);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1100px] mx-auto p-4 bg-cc-bg-page rounded-3xl border border-cc-border-light shadow-2xl">
      <div className="flex justify-between items-center bg-cc-bg-card p-4 rounded-2xl border border-cc-border shadow-md">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-serif">
            {drill.category} Drill
          </span>
          <span className="text-lg font-serif font-black text-cc-text-primary leading-tight">
            {drill.title}
          </span>
        </div>
        <Link
          href="/learn/drills"
          className="text-xs text-cc-text-secondary hover:text-white transition-colors border border-cc-border-light px-4 py-2 rounded-xl bg-cc-bg-sidebar hover:bg-cc-bg-hover"
        >
          ← All Drills
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[600px] relative rounded-2xl overflow-hidden border border-cc-border shadow-xl">
            <Board
              position={boardPosition}
              flipped={drill.playerColor === "b"}
              viewMode="2d"
              onPieceDrop={handlePieceDrop}
              squareStyles={{}}
              onSquareClick={() => {}}
            />
          </div>
        </div>
        
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-cc-bg-card p-6 rounded-2xl border border-cc-border shadow-md flex flex-col gap-4 text-left">
            <h3 className="text-lg font-serif font-extrabold text-white">Instructions</h3>
            <p className="text-sm text-zinc-400">{drill.description}</p>
            
            <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
              <span className={`text-sm font-bold ${statusColor}`}>{statusMessage}</span>
            </div>

            <button
              onClick={handleRestart}
              className="mt-auto py-3 w-full bg-cc-bg-sidebar hover:bg-zinc-800 text-white font-bold rounded-xl transition-all border border-zinc-700"
            >
              Restart Drill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
