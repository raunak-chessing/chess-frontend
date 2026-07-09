"use client";

import { useState, useCallback, useMemo } from "react";
import { Chess, Square } from "chess.js";
import type {
  GameMode,
  LastMove,
  SquareStyles,
  PieceCount,
} from "../types/game.types";
import { BOARD_THEME } from "../constants/boardTheme";

function getKingSquare(game: Chess, color: "w" | "b"): string {
  const board = game.board();
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === "k" && piece.color === color) {
        return files[c] + ranks[r];
      }
    }
  }
  return "";
}

function getCapturedPieces(gameInstance: Chess): string[] {
  const initial: Record<string, PieceCount> = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
  };

  const current: Record<string, PieceCount> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };

  gameInstance.board().forEach((row) => {
    row.forEach((square) => {
      if (square) {
        current[square.color][square.type as keyof PieceCount]++;
      }
    });
  });

  const list: string[] = [];

  for (const color of ["w", "b"] as const) {
    for (const [type, count] of Object.entries(initial[color])) {
      const diff = count - current[color][type as keyof PieceCount];
      for (let i = 0; i < diff; i++) {
        list.push(color + type);
      }
    }
  }

  return list;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function playMoveSound(moveResult: any, inCheckAfterMove: boolean) {
  let url = "/sounds/move.mp3";
  if (inCheckAfterMove) {
    url = "/sounds/check.mp3";
  } else if (moveResult.captured) {
    url = "/sounds/capture.mp3";
  }
  const audio = new Audio(url);
  audio.play().catch(() => {});
}

export interface GameState {
  game: Chess;
  fen: string;
  selectedSquare: string;
  lastMove: LastMove | null;
  flipped: boolean;
  autoFlip: boolean;
  capturedWhite: string[];
  capturedBlack: string[];
  turn: "w" | "b";
}

export interface GameActions {
  handlePieceDrop: (
    source: string,
    target: string,
    gameMode: GameMode,
    joinedRoom: string,
    playerColor: "w" | "b" | null,
    socket: { emit: (event: string, data: Record<string, string>) => void } | null,
  ) => boolean;
  handleSquareClick: (
    square: string,
    gameMode: GameMode,
    joinedRoom: string,
    playerColor: "w" | "b" | null,
    socket: { emit: (event: string, data: Record<string, string>) => void } | null,
  ) => void;
  getSquareStyles: () => SquareStyles;
  handleUndo: (
    gameMode: GameMode,
    joinedRoom: string,
    socket: { emit: (event: string, data: Record<string, string>) => void } | null,
  ) => void;
  handleReset: (
    gameMode: GameMode,
    joinedRoom: string,
    socket: { emit: (event: string, data: Record<string, unknown>) => void } | null,
  ) => void;
  handleAutoFlipToggle: (checked: boolean) => void;
  setFlipped: (val: boolean | ((prev: boolean) => boolean)) => void;
  resetGame: (flipBoard?: boolean) => void;
  applyMove: (from: string, to: string) => boolean;
  applyUndo: () => void;
}

export function useGameState(): GameState & GameActions {
  const [game] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [autoFlip, setAutoFlip] = useState<boolean>(false);

  const syncFlipState = useCallback(
    (nextTurn: "w" | "b", isAutoFlipActive: boolean) => {
      if (isAutoFlipActive) {
        setFlipped(nextTurn === "b");
      }
    },
    [],
  );

  const resetGame = useCallback(
    (flipBoard = false) => {
      game.reset();
      setFen(game.fen());
      setSelectedSquare("");
      setLastMove(null);
      if (flipBoard) {
        setFlipped(true);
      } else if (autoFlip) {
        setFlipped(false);
      }
    },
    [game, autoFlip],
  );

  const applyMove = useCallback(
    (from: string, to: string): boolean => {
      try {
        const move = game.move({ from, to, promotion: "q" });
        if (move) {
          setFen(game.fen());
          setSelectedSquare("");
          setLastMove({ from, to });
          playMoveSound(move, game.inCheck());
          return true;
        }
      } catch {
        // invalid move
      }
      return false;
    },
    [game],
  );

  const applyUndo = useCallback(() => {
    const undone = game.undo();
    if (undone) {
      setFen(game.fen());
      setSelectedSquare("");
      const history = game.history({ verbose: true });
      if (history.length > 0) {
        const last = history[history.length - 1];
        setLastMove({ from: last.from, to: last.to });
      } else {
        setLastMove(null);
      }
      const audio = new Audio("/sounds/move.mp3");
      audio.play().catch(() => {});
    }
  }, [game]);

  const handlePieceDrop = useCallback(
    (
      sourceSquare: string,
      targetSquare: string,
      gameMode: GameMode,
      joinedRoom: string,
      playerColor: "w" | "b" | null,
      socket: { emit: (event: string, data: Record<string, string>) => void } | null,
    ): boolean => {
      if (game.isGameOver()) return false;
      const currentTurn = game.turn();

      if (gameMode === "online") {
        if (!joinedRoom || playerColor !== currentTurn) return false;
      } else {
        const isAiTurn =
          (gameMode === "computer-black" && currentTurn === "b") ||
          (gameMode === "computer-white" && currentTurn === "w");
        if (isAiTurn) return false;
      }

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });

        if (move) {
          const nextFen = game.fen();
          setFen(nextFen);
          setSelectedSquare("");
          setLastMove({ from: sourceSquare, to: targetSquare });
          playMoveSound(move, game.inCheck());

          if (gameMode === "online" && socket && joinedRoom) {
            socket.emit("makeMove", {
              room: joinedRoom,
              from: sourceSquare,
              to: targetSquare,
              fen: nextFen,
            });
          } else {
            syncFlipState(game.turn(), autoFlip);
          }
          return true;
        }
      } catch {
        return false;
      }
      return false;
    },
    [game, autoFlip, syncFlipState],
  );

  const handleSquareClick = useCallback(
    (
      square: string,
      gameMode: GameMode,
      joinedRoom: string,
      playerColor: "w" | "b" | null,
      socket: { emit: (event: string, data: Record<string, string>) => void } | null,
    ) => {
      if (game.isGameOver()) return;
      const currentTurn = game.turn();

      if (gameMode === "online") {
        if (!joinedRoom || playerColor !== currentTurn) return;
      } else {
        const isAiTurn =
          (gameMode === "computer-black" && currentTurn === "b") ||
          (gameMode === "computer-white" && currentTurn === "w");
        if (isAiTurn) return;
      }

      if (selectedSquare === square) {
        setSelectedSquare("");
        return;
      }

      if (selectedSquare) {
        try {
          const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: "q",
          });

          if (move) {
            const nextFen = game.fen();
            setFen(nextFen);
            setSelectedSquare("");
            setLastMove({ from: selectedSquare, to: square });
            playMoveSound(move, game.inCheck());

            if (gameMode === "online" && socket && joinedRoom) {
              socket.emit("makeMove", {
                room: joinedRoom,
                from: selectedSquare,
                to: square,
                fen: nextFen,
              });
            } else {
              syncFlipState(game.turn(), autoFlip);
            }
            return;
          }
        } catch {
          // invalid move, fall through
        }
      }

      const piece = game.get(square as Square);
      const turn = game.turn();
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare("");
      }
    },
    [game, selectedSquare, autoFlip, syncFlipState],
  );

  const getSquareStyles = useCallback((): SquareStyles => {
    const styles: SquareStyles = {};

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: BOARD_THEME.lastMoveColor };
      styles[lastMove.to] = { backgroundColor: BOARD_THEME.lastMoveColor };
    }

    if (game.inCheck()) {
      const kingSq = getKingSquare(game, game.turn());
      if (kingSq) {
        styles[kingSq] = { backgroundColor: BOARD_THEME.checkColor };
      }
    }

    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: BOARD_THEME.selectedColor };

      const moves = game.moves({
        square: selectedSquare as Square,
        verbose: true,
      });

      moves.forEach((m) => {
        styles[m.to] = {
          background: game.get(m.to as Square)
            ? BOARD_THEME.captureHintColor
            : BOARD_THEME.moveHintColor,
        };
      });
    }

    return styles;
  }, [game, lastMove, selectedSquare]);

  const handleUndo = useCallback(
    (
      gameMode: GameMode,
      joinedRoom: string,
      socket: { emit: (event: string, data: Record<string, string>) => void } | null,
    ) => {
      if (game.history().length === 0) return;

      if (gameMode === "online") {
        if (!joinedRoom || !socket) return;
        const undone = game.undo();
        if (undone) {
          const nextFen = game.fen();
          setFen(nextFen);
          setSelectedSquare("");

          let prevFrom = "";
          let prevTo = "";
          const history = game.history({ verbose: true });
          if (history.length > 0) {
            const last = history[history.length - 1];
            setLastMove({ from: last.from, to: last.to });
            prevFrom = last.from;
            prevTo = last.to;
          } else {
            setLastMove(null);
          }

          socket.emit("undoMove", {
            room: joinedRoom,
            fen: nextFen,
            from: prevFrom,
            to: prevTo,
          });

          const audio = new Audio("/sounds/move.mp3");
          audio.play().catch(() => {});
        }
      } else {
        const undone = game.undo();
        if (undone) {
          setFen(game.fen());
          setSelectedSquare("");

          const history = game.history({ verbose: true });
          if (history.length > 0) {
            const last = history[history.length - 1];
            setLastMove({ from: last.from, to: last.to });
          } else {
            setLastMove(null);
          }

          syncFlipState(game.turn(), autoFlip);
          const audio = new Audio("/sounds/move.mp3");
          audio.play().catch(() => {});
        }
      }
    },
    [game, autoFlip, syncFlipState],
  );

  const handleReset = useCallback(
    (
      gameMode: GameMode,
      joinedRoom: string,
      socket: { emit: (event: string, data: Record<string, unknown>) => void } | null,
    ) => {
      if (gameMode === "online") {
        if (joinedRoom && socket) {
          socket.emit("resetGame", { room: joinedRoom });
        }
      } else {
        resetGame();
      }
    },
    [resetGame],
  );

  const handleAutoFlipToggle = useCallback(
    (checked: boolean) => {
      setAutoFlip(checked);
      if (checked) {
        setFlipped(game.turn() === "b");
      }
    },
    [game],
  );

  const captured = useMemo(() => {
    if (!fen) return [];
    return getCapturedPieces(game);
  }, [game, fen]);
  const capturedWhite = useMemo(
    () => captured.filter((p) => p.startsWith("w") && p !== "wk"),
    [captured],
  );
  const capturedBlack = useMemo(
    () => captured.filter((p) => p.startsWith("b") && p !== "bk"),
    [captured],
  );

  return {
    game,
    fen,
    selectedSquare,
    lastMove,
    flipped,
    autoFlip,
    capturedWhite,
    capturedBlack,
    turn: game.turn(),
    handlePieceDrop,
    handleSquareClick,
    getSquareStyles,
    handleUndo,
    handleReset,
    handleAutoFlipToggle,
    setFlipped,
    resetGame,
    applyMove,
    applyUndo,
  };
}
