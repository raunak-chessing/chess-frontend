"use client";

import React, { memo } from "react";
import {
  Chessboard as BaseChessboard,
  ChessboardProvider,
} from "react-chessboard";
import type { BoardProps } from "./Board.types";
import { BOARD_THEME } from "../../constants/boardTheme";

const Board = memo(function Board({
  position,
  flipped,
  onPieceDrop,
  squareStyles,
  onSquareClick,
}: BoardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePieceDrop = ({ sourceSquare, targetSquare }: any): boolean => {
    return onPieceDrop(sourceSquare, targetSquare);
  };

  return (
    <div className={`w-full max-w-[560px] aspect-square rounded-xl overflow-hidden shadow-2xl ${BOARD_THEME.borderClass} p-1`}>
      <ChessboardProvider
        options={{
          position: position,
          onPieceDrop: handlePieceDrop,
          boardOrientation: flipped ? "black" : "white",
          darkSquareStyle: { backgroundColor: BOARD_THEME.darkSquareColor },
          lightSquareStyle: { backgroundColor: BOARD_THEME.lightSquareColor },
          boardStyle: {
            borderRadius: "8px",
            boxShadow: BOARD_THEME.boardShadow,
          },
          allowDrawingArrows: true,
          clearArrowsOnClick: true,
          showAnimations: true,
          animationDurationInMs: 200,
          showNotation: true,
          squareStyles: squareStyles,
          onSquareClick: ({ square }) => onSquareClick?.(square),
        }}
      >
        <BaseChessboard />
      </ChessboardProvider>
    </div>
  );
});

export default Board;
