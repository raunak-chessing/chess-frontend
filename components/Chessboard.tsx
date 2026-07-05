"use client";

import React from "react";
import { Chessboard as BaseChessboard, ChessboardProvider } from "react-chessboard";

interface ChessboardWrapperProps {
  position: string;
  flipped: boolean;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  squareStyles?: Record<string, React.CSSProperties>;
  onSquareClick?: (square: string) => void;
  onSquareRightClick?: (square: string) => void;
}

export default function Chessboard({
  position,
  flipped,
  onPieceDrop,
  squareStyles,
  onSquareClick,
  onSquareRightClick
}: ChessboardWrapperProps) {
  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    return onPieceDrop(sourceSquare, targetSquare);
  };

  return (
    <div className="w-full max-w-[560px] aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-zinc-700 bg-zinc-800 p-1">
      <ChessboardProvider
        options={{
          position: position,
          onPieceDrop: handlePieceDrop,
          boardOrientation: flipped ? "black" : "white",
          darkSquareStyle: { backgroundColor: "#078987ff" },
          lightSquareStyle: { backgroundColor: "#ffffffff" },
          boardStyle: {
            borderRadius: "8px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
          },
          allowDrawingArrows: true,
          clearArrowsOnClick: true,
          showAnimations: true,
          animationDurationInMs: 200,
          showNotation: true,
          squareStyles: squareStyles,
          onSquareClick: ({ square }) => onSquareClick?.(square),
          onSquareRightClick: ({ square }) => onSquareRightClick?.(square),
        }}
      >
        <BaseChessboard />
      </ChessboardProvider>
    </div>
  );
}
