import { memo, useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Board } from "../Board";
import { formatTime, playSound } from "../../../../lib/utils";
import { usePuzzlesStore } from "../../../puzzles/store/puzzlesStore";

interface PuzzleRushProps {
  onReturnHome: () => void;
}

export const PuzzleRush = memo(function PuzzleRush({ onReturnHome }: PuzzleRushProps) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("text-cc-text-primary");

  const { rushBatch, fetchRushBatch, currentRushIndex, nextRushPuzzle, resetRush } = usePuzzlesStore();
  const puzzle = rushBatch[currentRushIndex];

  // Local chess instance for validating moves
  const [localChess, setLocalChess] = useState<Chess>(new Chess());

  const [boardPosition, setBoardPosition] = useState<string>("start");

  // Timer countdown hook
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // Sync FEN when starting a new puzzle
  const loadPuzzle = useCallback((idx: number) => {
    const p = rushBatch[idx];
    if (!p) {
      if (rushBatch.length > 0) setIsGameOver(true);
      return;
    }
    const c = new Chess(p.fen);
    setLocalChess(c);
    setBoardPosition(p.fen);
    setCurrentMoveIdx(0);
    setStatusMessage("Puzzle " + p.id);
    setStatusColor("text-cc-text-primary");
  }, [rushBatch]);

  useEffect(() => {
    // Initial fetch
    if (rushBatch.length === 0 && !isGameOver) {
      fetchRushBatch();
    }
  }, [rushBatch.length, isGameOver, fetchRushBatch]);

  useEffect(() => {
    loadPuzzle(currentRushIndex);
  }, [currentRushIndex, loadPuzzle]);

  const handlePieceDrop = useCallback((source: string, target: string): boolean => {
    if (isGameOver || !puzzle) return false;

    const moveStr = `${source}${target}`;
    const correctMove = puzzle.moves[currentMoveIdx];
    const expectedFromTo = correctMove.slice(0, 4);
    const expectedPromotion = correctMove.length > 4 ? correctMove[4] : undefined;

    if (moveStr === expectedFromTo) {
      try {
        const move = localChess.move({ from: source, to: target, promotion: expectedPromotion });
        if (move) {
          setBoardPosition(localChess.fen());
          const nextIdx = currentMoveIdx + 1;

          // Play move sound
          playSound("/sounds/move.mp3");

          if (nextIdx >= puzzle.moves.length) {
            // Puzzle Solved!
            setScore((s) => s + 1);
            setStatusMessage("Correct!");
            setStatusColor("text-cc-green font-bold");

            playSound("/sounds/capture.mp3");

            // Brief delay then load next puzzle
            setTimeout(() => {
              nextRushPuzzle();
            }, 800);
          } else {
            // Wait for next move
            setCurrentMoveIdx(nextIdx);
          }
          return true;
        }
      } catch (err) {
        // Fall through to incorrect
      }
    }

    // Incorrect move
    playSound("/sounds/check.mp3");

    setLives((l) => {
      const nextLives = l - 1;
      if (nextLives <= 0) {
        setIsGameOver(true);
      }
      return nextLives;
    });

    setStatusMessage("Oops, that's not the best move! Try again.");
    setStatusColor("text-red-500 font-bold");

    // Reset board position to starting puzzle state
    const c = new Chess(puzzle.fen);
    setLocalChess(c);
    setBoardPosition(puzzle.fen);
    setCurrentMoveIdx(0);

    return false;
  }, [isGameOver, puzzle, currentMoveIdx, localChess]);

  const handleRestart = useCallback(() => {
    resetRush();
    setScore(0);
    setLives(3);
    setTimeRemaining(180);
    setIsGameOver(false);
    fetchRushBatch();
  }, [fetchRushBatch, resetRush]);

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1100px] mx-auto p-4 bg-cc-bg-page rounded-3xl border border-cc-border-light shadow-2xl">
      {/* Header Dashboard */}
      <div className="flex flex-wrap justify-between items-center bg-cc-bg-card p-4 rounded-2xl border border-cc-border shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl font-serif font-extrabold text-cc-text-primary uppercase tracking-wider">
            Puzzle Rush
          </span>
          <span className="text-xs font-mono font-bold bg-cc-green/10 text-cc-green border border-cc-green/20 px-2 py-0.5 rounded-lg">
            3 Min Rush
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Solved Counter */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase font-serif">Solved</span>
            <span className="text-2xl font-extrabold text-cc-green font-mono leading-none">
              {score}
            </span>
          </div>

          {/* Strikes / Lives */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase font-serif">Strikes</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${
                    lives < idx
                      ? "bg-red-600/90 border-red-500 text-white"
                      : "bg-zinc-800/60 border-zinc-700 text-zinc-600"
                  }`}
                >
                  X
                </span>
              ))}
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase font-serif">Timer</span>
            <span className={`text-2xl font-extrabold font-mono leading-none ${timeRemaining < 30 ? "text-red-500 animate-pulse" : "text-white"}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Chessboard View (Left) */}
        <div className="md:col-span-8 flex justify-center">
          <div className="w-full max-w-[620px] aspect-square relative rounded-2xl overflow-hidden border border-cc-border shadow-xl">
            <Board
              position={boardPosition}
              flipped={puzzle?.fen.includes(" b ")}
              viewMode="2d"
              onPieceDrop={handlePieceDrop}
              squareStyles={{}}
              onSquareClick={() => {}}
            />

            {/* Game Over Screen Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-cc-bg-page/90 backdrop-blur-sm flex flex-col justify-center items-center gap-4 text-center z-50">
                <span className="text-3xl font-serif font-extrabold text-cc-text-primary uppercase">
                  Rush Completed!
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-400 text-xs">Puzzles Solved</span>
                  <span className="text-5xl font-black text-cc-green font-mono">
                    {score}
                  </span>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleRestart}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-cc-green hover:bg-cc-green-hover text-white active:scale-95 transition-all shadow-lg"
                  >
                    Restart Rush
                  </button>
                  <button
                    onClick={onReturnHome}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl bg-cc-bg-sidebar border border-cc-border-light text-zinc-300 hover:text-white active:scale-95 transition-all"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Puzzle Details & Options (Right) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3.5 bg-cc-bg-card p-5 rounded-2xl border border-cc-border shadow-md h-full min-h-[350px]">
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider font-serif border-b border-cc-border-light pb-2">
              Tactical Description
            </span>

            {puzzle ? (
              <div className="flex-1 flex flex-col justify-center gap-3 py-4">
                <span className="text-sm font-serif font-extrabold text-cc-text-primary leading-tight">
                  Puzzle #{currentRushIndex + 1}
                </span>
                <p className={`text-xs leading-relaxed transition-all duration-300 ${statusColor}`}>
                  {statusMessage}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs italic">
                Loading puzzle...
              </div>
            )}

            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-cc-border-light">
              <button
                onClick={onReturnHome}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-cc-bg-sidebar/75 hover:bg-cc-bg-sidebar border border-cc-border-light text-cc-text-secondary hover:text-white transition-all duration-300 cursor-pointer active:scale-95"
              >
                Quit Rush
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
