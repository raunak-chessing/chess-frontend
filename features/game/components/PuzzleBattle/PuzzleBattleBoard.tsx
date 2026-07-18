"use client";

import { memo, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
const Chessboard = dynamic(() => import("react-chessboard").then(mod => mod.Chessboard), { ssr: false });
import type { ChessboardOptions } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { BOARD_THEME } from "../../constants/boardTheme";

interface PuzzleBattleBoardProps {
  fen: string;
  flipped: boolean;
  isOpponent: boolean;
  isWinner: boolean;
  isLoser: boolean;
  onPieceDrop?: (source: string, target: string) => boolean;
  label: string;
  elo: number;
  avatar: string;
}

export const PuzzleBattleBoard = memo(function PuzzleBattleBoard({
  fen,
  flipped,
  isOpponent,
  isWinner,
  isLoser,
  onPieceDrop,
  label,
  elo,
  avatar,
}: PuzzleBattleBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const activeChess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return null;
    }
  }, [fen]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (selectedSquare && activeChess) {
      styles[selectedSquare] = { background: "rgba(255, 255, 0, 0.38)" };

      try {
        const moves = activeChess.moves({
          square: selectedSquare as Square,
          verbose: true,
        });
        moves.forEach((m) => {
          const isCapture = activeChess.get(m.to as Square);
          styles[m.to] = {
            background: isCapture
              ? "radial-gradient(circle, transparent 55%, rgba(0, 0, 0, 0.25) 56%, rgba(0, 0, 0, 0.25) 68%, transparent 69%)"
              : "radial-gradient(circle, rgba(0, 0, 0, 0.25) 24%, transparent 25%)",
            cursor: "pointer",
          };
        });
      } catch {
        // ignore
      }
    }
    return styles;
  }, [selectedSquare, activeChess]);

  const handleSquareClick = useCallback(
    (args: { piece: unknown; square: string }) => {
      if (isOpponent || !onPieceDrop || !activeChess) return;

      const { square } = args;

      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      if (selectedSquare) {
        const moved = onPieceDrop(selectedSquare, square);
        setSelectedSquare(null);
        if (moved) return;
      }

      const piece = activeChess.get(square as Square);
      const turn = activeChess.turn();
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    },
    [selectedSquare, activeChess, onPieceDrop, isOpponent]
  );

  const borderClass = isWinner
    ? "ring-4 ring-cc-green shadow-[0_0_40px_rgba(129,182,76,0.45)]"
    : isLoser
    ? "ring-4 ring-cc-accent-red shadow-[0_0_30px_rgba(204,51,51,0.35)]"
    : isOpponent
    ? "ring-2 ring-cc-border-light"
    : "ring-2 ring-cc-accent-blue shadow-[0_0_20px_rgba(91,164,207,0.2)]";

  const chessboardOptions = useMemo<ChessboardOptions>(
    () => ({
      id: `puzzle-battle-${isOpponent ? "opponent" : "player"}`,
      position: fen,
      onPieceDrop: ({ sourceSquare, targetSquare }) => {
        if (isOpponent || !onPieceDrop) return false;
        return onPieceDrop(sourceSquare, targetSquare ?? "");
      },
      boardOrientation: flipped ? "black" : "white",
      darkSquareStyle: { backgroundImage: BOARD_THEME.darkSquareGradient },
      lightSquareStyle: { backgroundImage: BOARD_THEME.lightSquareGradient },
      boardStyle: {
        borderRadius: "2px",
        boxShadow: BOARD_THEME.boardShadow,
      },
      allowDragging: !isOpponent,
      animationDurationInMs: 300,
      showAnimations: true,
      showNotation: false,
      allowDrawingArrows: !isOpponent,
      squareStyles,
      onSquareClick: ({ square }) => {
        handleSquareClick({ piece: null, square });
      },
    }),
    [fen, flipped, handleSquareClick, isOpponent, onPieceDrop, squareStyles],
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-500 ${
          isOpponent
            ? "bg-cc-bg-card border-cc-border"
            : "bg-cc-bg-card border-cc-accent-blue/30"
        }`}
      >
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xl font-bold border-2 ${
            isOpponent ? "border-cc-border bg-cc-bg-sidebar" : "border-cc-accent-blue/50 bg-cc-bg-sidebar"
          }`}
        >
          {avatar}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-cc-text-primary leading-tight">{label}</span>
          <span className="text-[10px] font-mono text-cc-text-muted">{elo} ELO</span>
        </div>
        {isOpponent && (
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-cc-bg-sidebar border border-cc-border rounded-full text-cc-text-muted font-semibold uppercase tracking-wide">
            Opponent
          </span>
        )}
        {!isOpponent && (
          <span className="ml-auto text-[10px] px-2 py-0.5 bg-cc-accent-blue/10 border border-cc-accent-blue/30 rounded-full text-cc-accent-blue font-semibold uppercase tracking-wide">
            You
          </span>
        )}
      </div>

      <div
        className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${borderClass}`}
        style={{ aspectRatio: "1 / 1" }}
      >
        {isOpponent && (
          <div className="absolute inset-0 z-10 pointer-events-none bg-cc-bg-page/15 backdrop-grayscale-[30%]" />
        )}

        <div
          className={`w-full h-full wood-board-frame rounded-2xl select-none flex items-center justify-center p-[4.5%] board-is-2d`}
        >
          <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
            <defs>
              <radialGradient id="lightWoodGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#fdf0e2" />
                <stop offset="65%" stopColor="#e5c5aa" />
                <stop offset="100%" stopColor="#bfa18a" />
              </radialGradient>
              <radialGradient id="darkWoodGrad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor="#5d554e" />
                <stop offset="65%" stopColor="#3c342f" />
                <stop offset="100%" stopColor="#1e1815" />
              </radialGradient>
            </defs>
          </svg>

          <div className="w-full h-full rounded shadow-inner border border-cc-border">
            <Chessboard options={chessboardOptions} />
          </div>
        </div>

        {isWinner && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <div className="animate-[battle-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both] text-5xl select-none">
              🏆
            </div>
          </div>
        )}
        {isLoser && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <div className="animate-[battle-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both] text-4xl select-none opacity-70">
              💀
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
