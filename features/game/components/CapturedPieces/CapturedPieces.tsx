import { memo } from "react";
import { PIECE_SYMBOLS } from "../../types/game.types";

interface CapturedPiecesProps {
  pieces: string[];
  colorClass: string;
  boardHeightClass?: string;
}

const CapturedPieces = memo(function CapturedPieces({
  pieces,
  colorClass,
  boardHeightClass = "lg:h-[620px]",
}: CapturedPiecesProps) {
  const isWhite = colorClass.includes("text-zinc-100");

  return (
    <div className={`flex flex-row lg:flex-col items-center justify-start gap-1 p-3 bg-cc-bg-sidebar border-2 border-cc-border-dark rounded-2xl w-full lg:w-20 ${boardHeightClass} min-h-[44px] overflow-y-auto shadow-[inset_0_4px_8px_rgba(0,0,0,0.85)]`}>
      {pieces.length === 0 ? (
        <span className="text-[10px] text-slate-600 italic lg:py-4" />
      ) : (
        pieces.map((p, idx) => (
          <span
            key={`${p}-${idx}`}
            className={`text-3xl select-none transition-all duration-300 font-serif ${
              isWhite
                ? "text-cc-text-primary drop-shadow-[0_3px_3px_rgba(0,0,0,0.9),0_0_1px_rgba(255,255,255,0.35)]"
                : "text-cc-bg-page drop-shadow-[0_3px_3px_rgba(0,0,0,0.95),0_0_1px_rgba(255,255,255,0.05)]"
            }`}
          >
            {PIECE_SYMBOLS[p]}
          </span>
        ))
      )}
    </div>
  );
});

export default CapturedPieces;
