"use client";

import { useEffect, useState, useCallback } from "react";
import { Chess } from "chess.js";
import { Board } from "../../../game/components/Board";
import { usePuzzlesStore } from "../../store/puzzlesStore";
import { playSound, formatTime } from "../../../../lib/utils";
import { puzzlesApi, DailyPuzzle as DailyPuzzleData } from "../../api/puzzlesApi";
import toast from "react-hot-toast";

export function DailyPuzzle({ onReturnHome }: { onReturnHome: () => void }) {
  const { submitAttempt } = usePuzzlesStore();
  
  const [dailyData, setDailyData] = useState<DailyPuzzleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [localChess, setLocalChess] = useState<Chess>(new Chess());
  const [boardPosition, setBoardPosition] = useState<string>("start");
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [isPuzzleCompleted, setIsPuzzleCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    puzzlesApi.getDailyPuzzle()
      .then(data => {
        setDailyData(data);
        const c = new Chess(data.puzzle.fen);
        setLocalChess(c);
        setBoardPosition(data.puzzle.fen);
        setStartTime(Date.now());
      })
      .catch(() => toast.error("Failed to load daily puzzle"))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePieceDrop = useCallback((source: string, target: string): boolean => {
    if (isPuzzleCompleted || isFailed || !dailyData) return false;

    const moveStr = `${source}${target}`;
    const correctMove = dailyData.puzzle.moves[currentMoveIdx];
    const expectedFromTo = correctMove.slice(0, 4);
    const expectedPromotion = correctMove.length > 4 ? correctMove[4] : undefined;

    if (moveStr === expectedFromTo) {
      try {
        const move = localChess.move({ from: source, to: target, promotion: expectedPromotion });
        if (move) {
          setBoardPosition(localChess.fen());
          const nextIdx = currentMoveIdx + 1;
          playSound("/sounds/move.mp3");

          if (nextIdx >= dailyData.puzzle.moves.length) {
            // Solved completely!
            setIsPuzzleCompleted(true);
            playSound("/sounds/capture.mp3");
            const timeSpent = Date.now() - startTime;
            submitAttempt(dailyData.puzzle.id, true, timeSpent);
          } else {
            setCurrentMoveIdx(nextIdx);
            
            const nextTurn = localChess.turn();
            const isOpponentTurn = (dailyData.puzzle.fen.split(' ')[1] !== nextTurn);
            
            if (isOpponentTurn && nextIdx < dailyData.puzzle.moves.length) {
                setTimeout(() => {
                    const nextMove = dailyData.puzzle.moves[nextIdx];
                    const oppSource = nextMove.substring(0, 2);
                    const oppTarget = nextMove.substring(2, 4);
                    const oppPromotion = nextMove.length > 4 ? nextMove[4] : undefined;
                    localChess.move({ from: oppSource, to: oppTarget, promotion: oppPromotion });
                    setBoardPosition(localChess.fen());
                    playSound("/sounds/move.mp3");
                    
                    const nextNextIdx = nextIdx + 1;
                    setCurrentMoveIdx(nextNextIdx);
                    
                    if (nextNextIdx >= dailyData.puzzle.moves.length) {
                        setIsPuzzleCompleted(true);
                        playSound("/sounds/capture.mp3");
                        const timeSpent = Date.now() - startTime;
                        submitAttempt(dailyData.puzzle.id, true, timeSpent);
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
    submitAttempt(dailyData.puzzle.id, false, timeSpent);
    
    // Snap back
    const c = new Chess(dailyData.puzzle.fen);
    setLocalChess(c);
    setBoardPosition(dailyData.puzzle.fen);
    return false;
  }, [dailyData, isPuzzleCompleted, isFailed, currentMoveIdx, localChess, startTime, submitAttempt]);

  if (isLoading) {
    return <div className="text-white text-center py-20">Loading Daily Puzzle...</div>;
  }

  if (!dailyData) {
    return (
      <div className="text-white text-center py-20 flex flex-col items-center gap-4">
        <span>No Daily Puzzle found for today!</span>
        <button onClick={onReturnHome} className="px-4 py-2 bg-cc-bg-sidebar rounded-md">Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1100px] mx-auto p-4 bg-cc-bg-page rounded-3xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        <div className="md:col-span-8 flex justify-center">
          <div className="w-full max-w-[620px] aspect-square relative rounded-2xl overflow-hidden border border-cc-border shadow-xl">
            <Board
              position={boardPosition}
              flipped={dailyData.puzzle.fen.includes(" w ") ? false : true}
              viewMode="2d"
              onPieceDrop={handlePieceDrop}
              squareStyles={{}}
              onSquareClick={() => {}}
            />

            {(isPuzzleCompleted || isFailed) && (
              <div className="absolute inset-0 bg-cc-bg-page/90 backdrop-blur-sm flex flex-col justify-center items-center gap-4 text-center z-50">
                <span className={`text-3xl font-serif font-extrabold uppercase ${isPuzzleCompleted ? 'text-cc-green' : 'text-red-500'}`}>
                  {isPuzzleCompleted ? 'Daily Puzzle Solved!' : 'Daily Puzzle Failed!'}
                </span>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={onReturnHome}
                    className="px-6 py-3 text-sm font-bold rounded-xl bg-cc-green hover:bg-cc-green-hover text-white active:scale-95 transition-all shadow-lg"
                  >
                    Back to Puzzles
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3.5 bg-cc-bg-card p-5 rounded-2xl border border-cc-border shadow-md h-full min-h-[350px]">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider font-serif border-b border-cc-border-light pb-2">
              Daily Puzzle: {dailyData.date.split('T')[0]}
            </span>

            <div className="flex-1 flex flex-col justify-start gap-3 py-4">
              <span className="text-lg font-serif font-extrabold text-cc-text-primary">
                Rating: {dailyData.puzzle.rating}
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {dailyData.puzzle.themes.map((theme, i) => (
                  <span key={i} className="text-xs bg-cc-bg-sidebar px-2 py-1 rounded-md text-cc-text-secondary border border-cc-border-light">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-cc-border-light">
               <span className="text-sm text-zinc-300 font-semibold text-center mb-2">
                  {dailyData.puzzle.fen.includes(" w ") ? "White to move" : "Black to move"}
               </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Forum Placeholder */}
      <div className="mt-8 bg-cc-bg-card border border-cc-border rounded-2xl p-6">
        <h3 className="text-xl font-bold font-serif text-white mb-4">Community Discussion</h3>
        <p className="text-zinc-400 text-sm mb-4">Discuss today's puzzle with the community.</p>
        <div className="flex gap-3 items-start opacity-50 pointer-events-none">
           <div className="w-10 h-10 rounded-full bg-zinc-800"></div>
           <div className="flex-1 flex flex-col gap-2">
              <div className="w-full h-12 rounded-lg bg-zinc-800"></div>
              <div className="w-24 h-8 rounded-lg bg-blue-600/50 self-end"></div>
           </div>
        </div>
        <p className="text-center text-xs text-zinc-500 mt-6 border-t border-zinc-800 pt-4">
          Comments feature coming soon.
        </p>
      </div>
    </div>
  );
}
