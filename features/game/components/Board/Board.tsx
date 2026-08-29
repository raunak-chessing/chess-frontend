"use client";

import React, { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  viewMode = "3d",
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

  const [rotX, setRotX] = useState(0);
  const [rotZ, setRotZ] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotZ: 0 });

  useEffect(() => {
    if (viewMode === "3d") {
      setRotX(0); // 3D transforms break react-chessboard drag-and-drop calculations
      setRotZ(0);
    } else if (viewMode === "2.5d") {
      setRotX(0);
      setRotZ(0);
    } else if (viewMode === "2d") {
      setRotX(0);
      setRotZ(0);
    }
  }, [viewMode]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".inner-chessboard-grid-container")) {
      return;
    }

    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotZ,
    };
  };

  const handleMouseMove = useCallback(() => {
    // 3D rotation dragging disabled because it breaks react-chessboard piece dragging
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest(".inner-chessboard-grid-container")) {
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;

    setIsDragging(true);
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      rotX,
      rotZ,
    };
  };

  const handleTouchMove = useCallback(() => {
    // 3D rotation dragging disabled
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const letters = flipped
    ? ["H", "G", "F", "E", "D", "C", "B", "A"]
    : ["A", "B", "C", "D", "E", "F", "G", "H"];
  const numbers = flipped
    ? ["1", "2", "3", "4", "5", "6", "7", "8"]
    : ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`relative wood-board-frame rounded-2xl shadow-3xl select-none board-container-responsive aspect-square flex items-center justify-center p-[4.5%] cursor-grab ${
        isDragging ? "cursor-grabbing" : ""
      } ${rotX === 0 ? "board-is-2d" : "board-is-3d"}`}
      style={{
        "--board-rot-x": `${rotX}deg`,
        "--board-rot-z": `${rotZ}deg`,
        transform: rotX === 0 && rotZ === 0 ? "none" : `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
        transformStyle: rotX === 0 && rotZ === 0 ? "flat" : "preserve-3d",
      } as React.CSSProperties}
    >
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
