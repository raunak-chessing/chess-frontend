import { memo, useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Board } from "../../../game/components/Board";

interface OpeningVariation {
  id: string;
  name: string;
  moves: string[]; // Coordinate moves, e.g. ["e2e4", "e7e5"]
  notations: string[]; // Algebraic notations, e.g. ["1. e4", "1. ... e5"]
  comments: string[]; // Positional idea comments
}

const OPENINGS: OpeningVariation[] = [
  {
    id: "ruy-lopez",
    name: "Ruy Lopez (Morphy Defense)",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6", "b5a4", "g8f6"],
    notations: ["1. e4", "1. ... e5", "2. Nf3", "2. ... Nc6", "3. Bb5", "3. ... a6", "4. Ba4", "4. ... Nf6"],
    comments: [
      "White begins with the most popular king's pawn opening, staking a claim in the center and opening lines for the Queen and Bishop.",
      "Black responds symmetrically, contesting the center d4/f4 squares and opening their own lines.",
      "White develops the Knight to active f3, immediately attacking Black's e5 pawn and preparing to castle kingside.",
      "Black develops their Knight to c6, defending the e5 pawn and contesting the d4 square.",
      "The Ruy Lopez (Spanish Opening). White develops the Bishop to b5, putting immediate pressure on the Knight that defends Black's e5 pawn.",
      "The Morphy Defense. Black questions White's bishop, asking if it will capture on c6 (Exchange Variation) or retreat.",
      "White retreats the bishop to a4 to maintain the tension and the potential pin on the c6 Knight.",
      "Black develops their Knight, preparing for castling and preparing counterplay on the e4 center pawn."
    ]
  },
  {
    id: "sicilian",
    name: "Sicilian Defense (Open Variation)",
    moves: ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4", "c5d4", "f3d4", "g8f6"],
    notations: ["1. e4", "1. ... c5", "2. Nf3", "2. ... d6", "3. d4", "3. ... cxd4", "4. Nxd4", "4. ... Nf6"],
    comments: [
      "White stakes an active claim in the center with 1. e4.",
      "The Sicilian Defense. Black fights asynchronously for the center d4 square, avoiding symmetric lines and playing for a win.",
      "White develops the Knight to f3, preparing for an active center push with d2-d4.",
      "Black solidifies their control over the e5 square and prepares to open up their light-squared bishop.",
      "White strikes open the center with d2-d4, challenging the c5 pawn.",
      "Black exchanges their flank c-pawn for White's center d-pawn, creating a half-open c-file for counterplay.",
      "White recaptures on d4, placing the knight in an active center outpost.",
      "Black develops their Knight to f6, developing with tempo by immediately attacking the e4 pawn."
    ]
  },
  {
    id: "queens-gambit",
    name: "Queen's Gambit (Declined)",
    moves: ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6", "c1g5", "f8e7"],
    notations: ["1. d4", "1. ... d5", "2. c4", "2. ... e6", "3. Nc3", "3. ... Nf6", "4. Bg5", "4. ... Be7"],
    comments: [
      "White starts with the Queen's pawn opening, staking a claim on the center and e5/c5 squares.",
      "Black matches White, preventing e2-e4 and taking control of the e4 square.",
      "The Queen's Gambit. White offers a flank pawn on c4 to divert Black's center d5 pawn, aiming to take complete control of the center.",
      "The Queen's Gambit Declined. Black declines the pawn to maintain a strong, solid pawn presence in the center.",
      "White develops their Knight to c3, increasing pressure on the d5 square.",
      "Black develops their Knight to f6, protecting the center and preparing castling.",
      "White develops their bishop, pinning Black's knight to the queen and threatening to capture on f6.",
      "Black develops their bishop to e7, immediately unpinning the knight and preparing to castle."
    ]
  }
];

interface OpeningExplorerProps {
  onReturnToDashboard: () => void;
}

export const OpeningExplorer = memo(function OpeningExplorer({ onReturnToDashboard }: OpeningExplorerProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [moveStep, setMoveStep] = useState(0); // 0 means starting position
  const [boardPosition, setBoardPosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  const activeOpening = OPENINGS[selectedIdx];

  // Rebuild FEN by applying moves up to current step
  useEffect(() => {
    const chess = new Chess();
    for (let i = 0; i < moveStep; i++) {
      const move = activeOpening.moves[i];
      if (move) {
        try {
          const fromSq = move.slice(0, 2);
          const toSq = move.slice(2, 4);
          chess.move({ from: fromSq, to: toSq, promotion: "q" });
        } catch (e) {
          // ignore invalid
        }
      }
    }
    setBoardPosition(chess.fen());
  }, [selectedIdx, moveStep, activeOpening]);

  const handleNext = () => {
    if (moveStep < activeOpening.moves.length) {
      new Audio("/sounds/move.mp3").play().catch(() => {});
      setMoveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (moveStep > 0) {
      new Audio("/sounds/move.mp3").play().catch(() => {});
      setMoveStep((prev) => prev - 1);
    }
  };

  const handleSelectOpening = (idx: number) => {
    setSelectedIdx(idx);
    setMoveStep(0);
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1100px] mx-auto p-4 bg-cc-bg-page rounded-3xl border border-cc-border-light shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center bg-cc-bg-card p-4 rounded-2xl border border-cc-border shadow-md">
        <div className="flex flex-col items-start text-left gap-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-serif">
            Opening Explorer
          </span>
          <span className="text-lg font-serif font-black text-cc-text-primary leading-tight">
            Learn Book Openings & Structures
          </span>
        </div>
        <button
          onClick={onReturnToDashboard}
          className="text-xs text-zinc-400 hover:text-white transition-colors border border-cc-border-light px-3.5 py-1.5 rounded-lg cursor-pointer"
        >
          ← Exit Explorer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Selector (Left) */}
        <div className="lg:col-span-3 flex flex-col gap-2.5 bg-cc-bg-sidebar/60 p-4 rounded-2xl border border-cc-border-light/50 min-h-[300px]">
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider font-serif border-b border-cc-border-light pb-1.5 mb-1.5 text-left">
            Select Opening Book
          </span>
          {OPENINGS.map((op, idx) => (
            <button
              key={op.id}
              onClick={() => handleSelectOpening(idx)}
              className={`p-3 rounded-xl border text-left transition-all duration-300 text-xs font-serif font-bold cursor-pointer ${
                selectedIdx === idx
                  ? "bg-cc-bg-sidebar border-cc-border-hover text-cc-text-primary"
                  : "bg-cc-bg-input/40 border-cc-border text-cc-text-secondary hover:bg-cc-bg-hover"
              }`}
            >
              {op.name}
            </button>
          ))}
        </div>

        {/* Board View (Center) */}
        <div className="lg:col-span-5 flex flex-col gap-4 items-center">
          <div className="w-full max-w-[450px] aspect-square rounded-2xl overflow-hidden border border-cc-border shadow-xl">
            <Board
              position={boardPosition}
              flipped={false}
              viewMode="2d"
              onPieceDrop={() => false} // View-only board explorer
              squareStyles={{}}
              onSquareClick={() => {}}
            />
          </div>

          {/* Stepper Controls */}
          <div className="flex gap-3.5 select-none mt-1">
            <button
              onClick={handlePrev}
              disabled={moveStep === 0}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-cc-bg-sidebar/80 hover:bg-cc-bg-sidebar border border-cc-border-light disabled:opacity-40 text-cc-text-secondary hover:text-white transition-all cursor-pointer"
            >
              ◀ Prev Move
            </button>
            <span className="px-4 py-2 text-xs font-bold font-mono bg-cc-bg-input border border-cc-border-light rounded-xl text-cc-text-primary">
              {moveStep} / {activeOpening.moves.length}
            </span>
            <button
              onClick={handleNext}
              disabled={moveStep === activeOpening.moves.length}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-cc-bg-sidebar/80 hover:bg-cc-bg-sidebar border border-cc-border-light disabled:opacity-40 text-cc-text-secondary hover:text-white transition-all cursor-pointer"
            >
              Next Move ▶
            </button>
          </div>
        </div>

        {/* Explanatory notes (Right) */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full min-h-[300px]">
          <div className="bg-cc-bg-card p-5 rounded-2xl border border-cc-border shadow-md flex flex-col gap-4 h-full flex-grow text-left">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-serif border-b border-cc-border-light pb-2">
              Opening Commentary
            </span>

            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[9px] text-zinc-500 font-bold uppercase font-mono tracking-widest">Active Move Notation</span>
              <span className="text-sm font-extrabold text-cc-text-primary">
                {moveStep > 0 ? activeOpening.notations[moveStep - 1] : "Starting Position"}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-start py-4">
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                {moveStep > 0
                  ? activeOpening.comments[moveStep - 1]
                  : "Welcome to the Opening Explorer! Select an opening from the left menu and use the controls below the board to walk through each variation move-by-move. Learn the core plans, ideas, and positional strategy behind the book moves."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
