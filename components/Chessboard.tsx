"use client";

import React from "react";
import { Chessboard as BaseChessboard } from "react-chessboard";

interface ChessboardWrapperProps {
  position: string;
  flipped: boolean;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
}

export default function Chessboard({ position, flipped, onPieceDrop }: ChessboardWrapperProps) {
  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    return onPieceDrop(sourceSquare, targetSquare);
  };

  return (
    <div className="w-full max-w-[500px] aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-700 bg-zinc-800 p-1">
      <BaseChessboard
        position={position}
        onPieceDrop={handlePieceDrop}
        boardOrientation={flipped ? "black" : "white"}
        customDarkSquareStyle={{ backgroundColor: "#769656" }}
        customLightSquareStyle={{ backgroundColor: "#eeeed2" }}
        customBoardStyle={{
          borderRadius: "8px",
          boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
        }}
      />
    </div>
  );
}
