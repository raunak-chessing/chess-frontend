"use client";

import { useEffect, useState, useCallback } from "react";
import { Chess } from "chess.js";
import { Board } from "../../../game/components/Board";
import { usePuzzlesStore } from "../../store/puzzlesStore";
import { playSound } from "../../../../lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function RatedPuzzles() {
  const router = useRouter();
  const { currentRatedPuzzle, fetchRatedPuzzle, submitAttempt, ratedPuzzleRatingChange, isLoading } = usePuzzlesStore();
  
  const [localChess, setLocalChess] = useState<Chess>(new Chess());
  const [boardPosition, setBoardPosition] = useState<string>("start");
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [isPuzzleCompleted, setIsPuzzleCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    fetchRatedPuzzle();
  }, [fetchRatedPuzzle]);

  useEffect(() => {
    if (currentRatedPuzzle) {
      const c = new Chess(currentRatedPuzzle.fen);
      setLocalChess(c);
      setBoardPosition(currentRatedPuzzle.fen);
      setCurrentMoveIdx(0);
      setIsPuzzleCompleted(false);
      setIsFailed(false);
      setStartTime(Date.now());
    }
  }, [currentRatedPuzzle]);

  const handlePieceDrop = useCallback((source: string, target: string): boolean => {
    if (isPuzzleCompleted || isFailed || !currentRatedPuzzle) return false;

    const moveStr = `${source}${target}`;
    const correctMove = currentRatedPuzzle.moves[currentMoveIdx];

    if (moveStr === correctMove) {
      try {
        const move = localChess.move({ from: source, to: target, promotion: "q" });
        if (move) {
          setBoardPosition(localChess.fen());
          const nextIdx = currentMoveIdx + 1;
          playSound("/sounds/move.mp3");

          if (nextIdx >= currentRatedPuzzle.moves.length) {
            // Solved completely!
            setIsPuzzleCompleted(true);
            playSound("/sounds/capture.mp3");
            const timeSpent = Date.now() - startTime;
            submitAttempt(currentRatedPuzzle.id, true, timeSpent);
          } else {
            setCurrentMoveIdx(nextIdx);
            // In a real scenario, if the puzzle has opponent moves in between, we would trigger it here.
            // But since our puzzles currently just string user moves (or interleaves),
            // if next move belongs to the opponent, we play it automatically.
            // For simplicity, let's assume `moves` only contains user moves right now, or interleaved.
            // In typical lichess format, `moves` is interleaved: user, opp, user, opp.
            // If the next turn in localChess belongs to the opponent (based on puzzle starting turn),
            // we should make the move for them.
            
            const nextTurn = localChess.turn();
            // Assuming fen turn is user's turn (since it's a puzzle for them).
            const isOpponentTurn = (currentRatedPuzzle.fen.split(' ')[1] !== nextTurn);
            
            if (isOpponentTurn && nextIdx < currentRatedPuzzle.moves.length) {
                setTimeout(() => {
                    const oppMoveStr = currentRatedPuzzle.moves[nextIdx];
                    const oppSource = oppMoveStr.substring(0, 2);
                    const oppTarget = oppMoveStr.substring(2, 4);
                    localChess.move({ from: oppSource, to: oppTarget, promotion: "q" });
                    setBoardPosition(localChess.fen());
                    playSound("/sounds/move.mp3");
                    
                    const nextNextIdx = nextIdx + 1;
                    setCurrentMoveIdx(nextNextIdx);
                    
                    if (nextNextIdx >= currentRatedPuzzle.moves.length) {
                        setIsPuzzleCompleted(true);
                        playSound("/sounds/capture.mp3");
                        const timeSpent = Date.now() - startTime;
                        submitAttempt(currentRatedPuzzle.id, true, timeSpent);
                    }
                }, 500);
            }
          }
          return true;
        }
      } catch (err) {
        // Fall through
      }
    }

    // Incorrect Move
    setIsFailed(true);
    playSound("/sounds/check.mp3");
    const timeSpent = Date.now() - startTime;
    submitAttempt(currentRatedPuzzle.id, false, timeSpent);
    
    // Snap back
    const c = new Chess(currentRatedPuzzle.fen);
    setLocalChess(c);
    setBoardPosition(currentRatedPuzzle.fen);
    return false;
  }, [currentRatedPuzzle, isPuzzleCompleted, isFailed, currentMoveIdx, localChess, startTime, submitAttempt]);

  if (isLoading && !currentRatedPuzzle) {
    return <div className="text-white text-center py-20">Loading Rated Puzzle...</div>;
  }

  if (!currentRatedPuzzle) {
    return <div className="text-white text-center py-20">No puzzles available for your rating yet!</div>;
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1100px] mx-auto p-4 bg-cc-bg-page rounded-3xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <div className="md:col-span-8 flex justify-center">
          <div className="w-full max-w-[620px] aspect-square relative rounded-2xl overflow-hidden border border-cc-border shadow-xl">
            <Board
              position={boardPosition}
              flipped={currentRatedPuzzle.fen.includes(" w ") ? false : true}
              viewMode="2d"
              onPieceDrop={handlePieceDrop}
              squareStyles={{}}
              onSquareClick={() => {}}
            />

            {(isPuzzleCompleted || isFailed) && (
              <div className="absolute inset-0 bg-cc-bg-page/90 backdrop-blur-sm flex flex-col justify-center items-center gap-4 text-center z-50">
                <span className={`text-3xl font-serif font-extrabold uppercase ${isPuzzleCompleted ? 'text-cc-green' : 'text-red-500'}`}>
                  {isPuzzleCompleted ? 'Puzzle Solved!' : 'Puzzle Failed!'}
                </span>
                
                {ratedPuzzleRatingChange !== null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-400 text-xs">Rating Change</span>
                    <span className={`text-4xl font-black font-mono ${ratedPuzzleRatingChange > 0 ? 'text-cc-green' : 'text-red-500'}`}>
                      {ratedPuzzleRatingChange > 0 ? '+' : ''}{ratedPuzzleRatingChange}
                    </span>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => fetchRatedPuzzle()}
                    className="px-6 py-3 text-sm font-bold rounded-xl bg-cc-green hover:bg-cc-green-hover text-white active:scale-95 transition-all shadow-lg"
                  >
                    Next Puzzle
                  </button>
                  <button
                    onClick={() => router.push("/puzzles")}
                    className="px-6 py-3 text-sm font-bold rounded-xl bg-cc-bg-sidebar border border-cc-border-light text-zinc-300 hover:text-white active:scale-95 transition-all"
                  >
                    Exit Training
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3.5 bg-cc-bg-card p-5 rounded-2xl border border-cc-border shadow-md h-full min-h-[350px]">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider font-serif border-b border-cc-border-light pb-2">
              Puzzle Information
            </span>

            <div className="flex-1 flex flex-col justify-center gap-3 py-4">
              <span className="text-lg font-serif font-extrabold text-cc-text-primary">
                Rating: {currentRatedPuzzle.rating}
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentRatedPuzzle.themes.map((theme, i) => (
                  <span key={i} className="text-xs bg-cc-bg-sidebar px-2 py-1 rounded-md text-cc-text-secondary border border-cc-border-light">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-cc-border-light">
               <span className="text-sm text-zinc-300 font-semibold text-center mb-2">
                  {currentRatedPuzzle.fen.includes(" w ") ? "White to move" : "Black to move"}
               </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
