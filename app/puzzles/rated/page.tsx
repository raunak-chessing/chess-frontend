"use client";

import { useEffect, useRef } from "react";
import { usePuzzlesStore } from "../../../features/puzzles/store/puzzlesStore";
import { PuzzleSolver } from "../../../features/puzzles/components/PuzzleSolver";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";

export default function RatedPuzzlesPage() {
  const { currentRatedPuzzle, fetchRatedPuzzle, submitAttempt, isLoading, ratedPuzzleRatingChange } = usePuzzlesStore();
  const startTimeRef = useRef(0);

  useEffect(() => {
    fetchRatedPuzzle();
    startTimeRef.current = Date.now();
  }, [fetchRatedPuzzle]);

  const handleSolve = (attempts: number) => {
    const timeSpentMs = Date.now() - startTimeRef.current;
    const success = attempts === 0;
    if (currentRatedPuzzle) {
      submitAttempt(currentRatedPuzzle.id, success, timeSpentMs);
    }
  };

  const handleFail = () => {
    const timeSpentMs = Date.now() - startTimeRef.current;
    if (currentRatedPuzzle) {
      submitAttempt(currentRatedPuzzle.id, false, timeSpentMs);
    }
  };

  const handleNext = () => {
    fetchRatedPuzzle();
    startTimeRef.current = Date.now();
  };

  if (isLoading && !currentRatedPuzzle) {
    return <LoadingState variant="fill" label="Loading rated puzzle…" />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
      <PageHeader title="Rated Training" backHref="/puzzles" />

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
