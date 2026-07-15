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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePieceDrop = ({ sourceSquare, targetSquare }: any): boolean => {
    return onPieceDrop(sourceSquare, targetSquare);
  };

  return (
    <div className="w-full aspect-square rounded-xl overflow-hidden shadow-2xl border-2 p-0.5 border-[var(--cc-border)] bg-[var(--cc-bg-card)]">
      <ChessboardProvider
        options={{
          position: position,
          onPieceDrop: handlePieceDrop,
          boardOrientation: flipped ? "black" : "white",
          darkSquareStyle: { backgroundColor: "#779952" },
          lightSquareStyle: { backgroundColor: "#eeedd2" },
          boardStyle: {
            borderRadius: "6px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
          },
          allowDrawingArrows: false,
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
