"use client";

import { useEffect, useState } from "react";
import { usePuzzlesStore } from "../../../features/puzzles/store/puzzlesStore";
import { PuzzleSolver } from "../../../features/puzzles/components/PuzzleSolver";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RatedPuzzlesPage() {
  const { currentRatedPuzzle, fetchRatedPuzzle, submitAttempt, isLoading, ratedPuzzleRatingChange } = usePuzzlesStore();
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    fetchRatedPuzzle();
    setStartTime(Date.now());
  }, [fetchRatedPuzzle]);

  const handleSolve = (attempts: number) => {
    const timeSpentMs = Date.now() - startTime;
    // For rated, success = solved on first attempt
    const success = attempts === 0;
    if (currentRatedPuzzle) {
      submitAttempt(currentRatedPuzzle.id, success, timeSpentMs);
    }
  };

  const handleFail = () => {
    // We only submit attempt on solve or if they explicitly give up,
    // but in rated puzzles usually a wrong move immediately impacts rating.
    // Let's assume if they fail once, it's marked as failed for rating, but they can continue solving for practice.
    const timeSpentMs = Date.now() - startTime;
    if (currentRatedPuzzle) {
      submitAttempt(currentRatedPuzzle.id, false, timeSpentMs);
    }
  };

  const handleNext = () => {
    fetchRatedPuzzle();
    setStartTime(Date.now());
  };

  if (isLoading && !currentRatedPuzzle) {
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
          Rated Training
        </div>
      </div>

      <div className="w-full max-w-[1100px] px-4">
        {ratedPuzzleRatingChange !== null && (
          <div className={`text-center font-bold mb-4 ${ratedPuzzleRatingChange >= 0 ? 'text-cc-green' : 'text-red-500'}`}>
            Rating {ratedPuzzleRatingChange >= 0 ? '+' : ''}{ratedPuzzleRatingChange}
          </div>
        )}
      </div>

      <PuzzleSolver
        puzzle={currentRatedPuzzle}
        onSolve={handleSolve}
        onFail={handleFail}
        onNext={handleNext}
        showNextButton={true}
      />
    </div>
  );
}
