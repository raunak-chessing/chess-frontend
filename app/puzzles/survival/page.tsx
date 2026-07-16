"use client";

import { useEffect, useState } from "react";
import { usePuzzlesStore } from "../../../features/puzzles/store/puzzlesStore";
import { PuzzleSolver } from "../../../features/puzzles/components/PuzzleSolver";
import { StrikeTracker } from "../../../features/puzzles/components/StrikeTracker";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SurvivalModePage() {
  const { rushBatch, currentRushIndex, fetchRushBatch, nextRushPuzzle, resetRush, isLoading } = usePuzzlesStore();
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    resetRush();
    fetchRushBatch(50); // Fetch a large batch for survival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentPuzzle = rushBatch[currentRushIndex];

  const handleSolve = () => {
    setScore(s => s + 1);
    setTimeout(() => {
      nextRushPuzzle();
    }, 1000);
  };

  const handleFail = () => {
    setStrikes(s => {
      const newStrikes = s + 1;
      if (newStrikes >= 3) {
        setIsGameOver(true);
      }
      return newStrikes;
    });
  };

  const handleRestart = () => {
    resetRush();
    setStrikes(0);
    setScore(0);
    setIsGameOver(false);
    fetchRushBatch(50);
  };

  if (isLoading && rushBatch.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 className="w-10 h-10 animate-spin text-cc-green" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      <div className="flex justify-between w-full max-w-[1100px] mb-4 px-4">
        <Link href="/puzzles" className="text-zinc-400 hover:text-white transition-colors">
          ← Back to Puzzles
        </Link>
        <div className="text-xl font-bold font-serif text-white">
          Survival Mode
        </div>
      </div>

      <div className="w-full max-w-[1100px] px-4 flex justify-between items-center mb-6 bg-cc-bg-card p-4 rounded-xl border border-cc-border shadow-md">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase font-serif">Solved</span>
          <span className="text-2xl font-extrabold text-cc-green font-mono leading-none">
            {score}
          </span>
        </div>
        <StrikeTracker strikes={strikes} />
      </div>

      {isGameOver ? (
        <div className="w-full max-w-[1100px] px-4">
          <div className="bg-cc-bg-card p-8 rounded-2xl border border-cc-border shadow-2xl flex flex-col items-center text-center">
            <h2 className="text-4xl font-serif font-extrabold text-white mb-2">Game Over!</h2>
            <p className="text-zinc-400 mb-6">You survived for {score} puzzles.</p>
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="px-6 py-3 font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg"
              >
                Try Again
              </button>
              <Link
                href="/puzzles"
                className="px-6 py-3 font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <PuzzleSolver
          puzzle={currentPuzzle}
          onSolve={handleSolve}
          onFail={handleFail}
          showNextButton={false}
        />
      )}
    </div>
  );
}
