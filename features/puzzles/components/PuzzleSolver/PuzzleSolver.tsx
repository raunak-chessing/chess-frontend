import { memo, useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import { Board } from "@/features/game/components/Board";
import { playSound } from "@/lib/utils";
import { Puzzle } from "../types/puzzles.types";

interface PuzzleSolverProps {
  puzzle: Puzzle | null;
  onSolve: (attempts: number) => void;
  onFail: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

export const PuzzleSolver = memo(function PuzzleSolver({
  puzzle,
  onSolve,
  onFail,
  onNext,
  showNextButton = false,
}: PuzzleSolverProps) {
  const [localChess, setLocalChess] = useState<Chess>(new Chess());
  const [boardPosition, setBoardPosition] = useState<string>("start");
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("text-cc-text-primary");
  const [isSolved, setIsSolved] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Sync FEN when starting a new puzzle
  useEffect(() => {
    if (puzzle) {
      const c = new Chess(puzzle.fen);
      setLocalChess(c);
      setBoardPosition(puzzle.fen);
      setCurrentMoveIdx(0);
      setIsSolved(false);
      setFailedAttempts(0);
      setStatusMessage("Find the best move!");
      setStatusColor("text-cc-text-primary");
    }
  }, [puzzle]);

  const handlePieceDrop = useCallback(
    (source: string, target: string): boolean => {
      if (!puzzle || isSolved) return false;

      const moveStr = `${source}${target}`;
      const correctMove = puzzle.moves[currentMoveIdx];

      if (moveStr === correctMove || moveStr + "q" === correctMove) {
        try {
          const move = localChess.move({ from: source, to: target, promotion: "q" });
          if (move) {
            setBoardPosition(localChess.fen());
            const nextIdx = currentMoveIdx + 1;

            playSound("/sounds/move.mp3");

            if (nextIdx >= puzzle.moves.length) {
              // Puzzle Solved!
              setIsSolved(true);
              setStatusMessage("Solved!");
              setStatusColor("text-cc-green font-bold");
              playSound("/sounds/capture.mp3");
              onSolve(failedAttempts);
            } else {
              setCurrentMoveIdx(nextIdx);
              
              // If the next move is the opponent's move, make it automatically
              setTimeout(() => {
                const oppMoveStr = puzzle.moves[nextIdx];
                if (oppMoveStr) {
                  const oppSource = oppMoveStr.substring(0, 2);
                  const oppTarget = oppMoveStr.substring(2, 4);
                  const oppProm = oppMoveStr.length > 4 ? oppMoveStr[4] : undefined;
                  const oppMove = localChess.move({ from: oppSource, to: oppTarget, promotion: oppProm || "q" });
                  if (oppMove) {
                    setBoardPosition(localChess.fen());
                    setCurrentMoveIdx(nextIdx + 1);
                    playSound("/sounds/move.mp3");
                  }
                }
              }, 500);
            }
            return true;
          }
        } catch (err) {
          // Fall through to incorrect
        }
      }

      // Incorrect move
      playSound("/sounds/check.mp3");
      setFailedAttempts((prev) => prev + 1);
      onFail();
      
      setStatusMessage("Oops, that's not the best move! Try again.");
      setStatusColor("text-red-500 font-bold");

      const c = new Chess(localChess.fen());
      setLocalChess(c);
      setBoardPosition(c.fen());
      
      return false;
    },
    [puzzle, currentMoveIdx, localChess, isSolved, onSolve, onFail, failedAttempts]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start w-full max-w-[1100px] mx-auto p-4 bg-cc-bg-page rounded-3xl border border-cc-border-light shadow-2xl">
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
        </div>
      </div>

      <div className="md:col-span-4 flex flex-col gap-4">
        <div className="flex flex-col gap-3.5 bg-cc-bg-card p-5 rounded-2xl border border-cc-border shadow-md h-full min-h-[350px]">
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider font-serif border-b border-cc-border-light pb-2">
            Tactical Description
          </span>

          {puzzle ? (
            <div className="flex-1 flex flex-col justify-center gap-3 py-4">
              <span className="text-sm font-serif font-extrabold text-cc-text-primary leading-tight">
                Puzzle {puzzle.id ? `#${puzzle.id.substring(0, 6)}` : ""}
              </span>
              <p className={`text-xs leading-relaxed transition-all duration-300 ${statusColor}`}>
                {statusMessage}
              </p>
              {puzzle.themes && puzzle.themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {puzzle.themes.map((theme) => (
                    <span key={theme} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded">
                      {theme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs italic">
              Loading puzzle...
            </div>
          )}

          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-cc-border-light">
            {isSolved && showNextButton && onNext && (
              <button
                onClick={onNext}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-cc-green hover:bg-cc-green-hover text-white transition-all duration-300 cursor-pointer active:scale-95"
              >
                Next Puzzle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
