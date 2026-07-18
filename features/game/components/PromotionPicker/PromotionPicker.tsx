import React from "react";

interface PromotionPickerProps {
  color: "w" | "b";
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

export function PromotionPicker({ color, onSelect, onCancel }: PromotionPickerProps) {
  const pieces: ("q" | "r" | "b" | "n")[] = ["q", "n", "r", "b"];
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg">
      <div className="bg-cc-bg-card border border-cc-border p-4 rounded-xl shadow-2xl flex flex-col gap-3">
        <h3 className="text-center font-bold text-cc-text-primary text-sm tracking-widest uppercase">Promote Pawn</h3>
        <div className="flex gap-2">
          {pieces.map((p) => {
            // Using standard unicode pieces or images if available, for now unicode
            const symbol = color === "w"
              ? p === "q" ? "♕" : p === "r" ? "♖" : p === "b" ? "♗" : "♘"
              : p === "q" ? "♛" : p === "r" ? "♜" : p === "b" ? "♝" : "♞";
            return (
              <button
                key={p}
                onClick={() => onSelect(p)}
                className="w-14 h-14 text-4xl bg-cc-bg-input hover:bg-cc-bg-hover border border-cc-border rounded-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                {symbol}
              </button>
            );
          })}
        </div>
        <button
          onClick={onCancel}
          className="mt-1 w-full py-2 bg-red-900/40 text-red-400 font-bold text-xs rounded-lg hover:bg-red-900/60 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
