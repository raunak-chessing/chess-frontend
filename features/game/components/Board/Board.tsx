"use client";

import { memo, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
const Chessboard = dynamic(() => import("react-chessboard").then(mod => mod.Chessboard), { ssr: false });
import type { ChessboardOptions } from "react-chessboard";
import type { BoardProps } from "./Board.types";
import { DEFAULT_BOARD_SKIN } from "../../constants/boardTheme";
import { Chess } from "chess.js";
import { WoodGradientDefs } from "../WoodGradientDefs";

const Board = memo(function Board({
  position,
  flipped,
  onPieceDrop,
  squareStyles,
  onPremoveClear,
  isDraggablePiece,
  onSquareClick,
  skin = DEFAULT_BOARD_SKIN,
}: BoardProps) {

  const handlePieceDrop = useCallback<NonNullable<ChessboardOptions["onPieceDrop"]>>(
    ({ piece, sourceSquare, targetSquare }) => {
      if (!targetSquare) return false;
      // Client-side validation to prevent sending invalid moves to the server
      try {
        const chess = new Chess(position);
        const move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: piece.pieceType[1]?.toLowerCase() ?? 'q',
        });
        if (!move) return false;
      } catch (e) {
        return false;
      }
      return onPieceDrop(sourceSquare, targetSquare, piece.pieceType);
    },
    [onPieceDrop, position],
  );

  const chessboardOptions = useMemo<ChessboardOptions>(
    () => ({
      id: "main-game-board",
      position,
      onPieceDrop: handlePieceDrop,
      boardOrientation: flipped ? "black" : "white",
      darkSquareStyle: { backgroundImage: skin.darkSquareGradient },
      lightSquareStyle: { backgroundImage: skin.lightSquareGradient },
      boardStyle: {
        borderRadius: "2px",
        boxShadow: skin.boardShadow,
      },
      allowDragOffBoard: true,
      allowDrawingArrows: true,
      clearArrowsOnClick: true,
      animationDurationInMs: 200,
      showAnimations: true,
      showNotation: false,
      squareStyles,
      canDragPiece: ({ piece, square }) => {
        if (!isDraggablePiece) return true;
        return isDraggablePiece({
          piece: piece.pieceType,
          sourceSquare: square ?? "",
        });
      },
      onSquareClick: ({ square }) => {
        onSquareClick?.(square);
      },
    }),
    [flipped, handlePieceDrop, isDraggablePiece, onSquareClick, position, squareStyles, skin],
  );

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault(); // Prevent native right-click menu
    if (onPremoveClear) onPremoveClear();
  }, [onPremoveClear]);

  useEffect(() => {
    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, [handleContextMenu]);

  const letters = flipped
    ? ["H", "G", "F", "E", "D", "C", "B", "A"]
    : ["A", "B", "C", "D", "E", "F", "G", "H"];
  const numbers = flipped
    ? ["1", "2", "3", "4", "5", "6", "7", "8"]
    : ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className="relative wood-board-frame rounded-2xl shadow-3xl select-none board-container-responsive aspect-square flex items-center justify-center p-[4.5%] board-is-2d">
      <WoodGradientDefs />
      <div className="absolute top-[0.6%] left-[7.5%] right-[7.5%] h-[3.5%] flex items-center justify-around text-[clamp(8px,1.8cqw,12px)] font-extrabold text-cc-text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] font-serif">
        {letters.map((l) => (
          <span key={l} className="text-center flex-1">{l}</span>
        ))}
      </div>
      <div className="absolute bottom-[0.6%] left-[7.5%] right-[7.5%] h-[3.5%] flex items-center justify-around text-[clamp(8px,1.8cqw,12px)] font-extrabold text-cc-text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] font-serif">
        {letters.map((l) => (
          <span key={l} className="text-center flex-1">{l}</span>
        ))}
      </div>
      <div className="absolute left-[0.8%] top-[7.5%] bottom-[7.5%] w-[3.5%] flex flex-col items-center justify-around text-[clamp(8px,1.8cqw,12px)] font-extrabold text-cc-text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] font-serif">
        {numbers.map((n) => (
          <span key={n} className="flex items-center justify-center flex-1">{n}</span>
        ))}
      </div>
      <div className="absolute right-[0.8%] top-[7.5%] bottom-[7.5%] w-[3.5%] flex flex-col items-center justify-around text-[clamp(8px,1.8cqw,12px)] font-extrabold text-cc-text-primary drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] font-serif">
        {numbers.map((n) => (
          <span key={n} className="flex items-center justify-center flex-1">{n}</span>
        ))}
      </div>

      <div className="w-full h-full rounded shadow-inner border border-cc-border inner-chessboard-grid-container">
        <Chessboard options={chessboardOptions} />
      </div>
    </div>
  );
});

export default Board;
