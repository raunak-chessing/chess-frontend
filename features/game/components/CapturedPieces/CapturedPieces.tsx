import { memo } from "react";
import { PIECE_SYMBOLS } from "../../types/game.types";

interface CapturedPiecesProps {
  pieces: string[];
  colorClass: string;
}

const CapturedPieces = memo(function CapturedPieces({ pieces, colorClass }: CapturedPiecesProps) {
  return (
    <div className="flex flex-row lg:flex-col items-center justify-start gap-1 p-2 bg-slate-950/40 rounded-xl w-full lg:w-20 lg:h-[560px] min-h-[44px] overflow-y-auto">
      {pieces.length === 0 ? (
        <span className="text-[10px] text-slate-600 italic lg:py-4" />
      ) : (
        pieces.map((p, idx) => (
          <span
            key={`${p}-${idx}`}
            className={`text-3xl drop-shadow-md select-none ${colorClass}`}
          >
            {PIECE_SYMBOLS[p]}
          </span>
        ))
      )}
    </div>
  );
});

export default CapturedPieces;
