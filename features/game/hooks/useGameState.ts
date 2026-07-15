"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Chess, Square } from "chess.js";
import type {
  GameMode,
  GameVariant,
  LastMove,
  SquareStyles,
  PieceCount,
} from "../types/game.types";
import { BOARD_THEME } from "../constants/boardTheme";
import { playSound } from "../../../lib/utils";

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

function generateChess960FEN(): string {
  const pieces = new Array(8).fill(null);

  const lightSquares = [1, 3, 5, 7];
  const lightBishopPos = lightSquares[Math.floor(Math.random() * 4)];
  pieces[lightBishopPos] = "B";

  const darkSquares = [0, 2, 4, 6];
  const darkBishopPos = darkSquares[Math.floor(Math.random() * 4)];
  pieces[darkBishopPos] = "B";

  const getEmptySquares = () =>
    pieces.map((p, i) => (p === null ? i : -1)).filter((i) => i !== -1);

  let empty = getEmptySquares();
  const queenPos = empty[Math.floor(Math.random() * empty.length)];
  pieces[queenPos] = "Q";

  empty = getEmptySquares();
  const knight1Pos = empty[Math.floor(Math.random() * empty.length)];
  pieces[knight1Pos] = "N";
  empty = getEmptySquares();
  const knight2Pos = empty[Math.floor(Math.random() * empty.length)];
  pieces[knight2Pos] = "N";

  empty = getEmptySquares();
  pieces[empty[0]] = "R";
  pieces[empty[1]] = "K";
  pieces[empty[2]] = "R";

  const whiteRow = pieces.join("");
  const blackRow = pieces.join("").toLowerCase();

  return `${blackRow}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRow} w KQkq - 0 1`;
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

function playMoveSound(moveResult: { captured?: string }, inCheckAfterMove: boolean) {
  let url = "/sounds/move.mp3";
  if (inCheckAfterMove) {
    url = "/sounds/check.mp3";
  } else if (moveResult.captured) {
    url = "/sounds/capture.mp3";
  }
  playSound(url);
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
  viewMoveIndex: number | null;
  variant: GameVariant;
  whiteChecks: number;
  blackChecks: number;
  variantWinner: "w" | "b" | null;
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
  resetGameWithVariant: (v: GameVariant, flipBoard?: boolean) => void;
  applyMove: (from: string, to: string) => boolean;
  applyUndo: () => void;
  setViewMoveIndex: (index: number | null) => void;
  setVariant: (v: GameVariant) => void;
}

export function useGameState(): GameState & GameActions {
  const [game] = useState<Chess>(() => new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [autoFlip, setAutoFlip] = useState<boolean>(false);
  const [viewMoveIndex, setViewMoveIndex] = useState<number | null>(null);

  const [variant, setVariant] = useState<GameVariant>("standard");
  const variantRef = useRef<GameVariant>(variant);
  useEffect(() => {
    variantRef.current = variant;
  }, [variant]);
  
  const [whiteChecks, setWhiteChecks] = useState<number>(0);
  const [blackChecks, setBlackChecks] = useState<number>(0);
  const [variantWinner, setVariantWinner] = useState<"w" | "b" | null>(null);

  const [initialFen, setInitialFen] = useState<string>(game.fen());

  const boardFen = useMemo(() => {
    if (viewMoveIndex === null) return fen;
    try {
      const tempGame = new Chess(initialFen);
      const history = game.history();
      for (let i = 0; i <= viewMoveIndex; i++) {
        tempGame.move(history[i]);
      }
      return tempGame.fen();
    } catch {
      return fen;
    }
  }, [fen, game, viewMoveIndex, initialFen]);

  const syncFlipState = useCallback(
    (nextTurn: "w" | "b", isAutoFlipActive: boolean) => {
      if (isAutoFlipActive) {
        setFlipped(nextTurn === "b");
      }
    },
    [],
  );

  const resetGameCore = useCallback(
    (variant?: GameVariant, flipBoard = false) => {
      if (variant !== undefined) {
        setVariant(variant);
      }
      const activeVariant = variant ?? variantRef.current;
      game.reset();
      let startFen = game.fen();
      if (activeVariant === "chess960") {
        startFen = generateChess960FEN();
        game.load(startFen);
      }
      setInitialFen(startFen);
      setFen(game.fen());
      setSelectedSquare("");
      setLastMove(null);
      setViewMoveIndex(null);
      setWhiteChecks(0);
      setBlackChecks(0);
      setVariantWinner(null);
      if (flipBoard) {
        setFlipped(true);
      } else if (autoFlip) {
        setFlipped(false);
      }
    },
    [game, autoFlip],
  );

  const resetGame = useCallback(
    (flipBoard = false) => {
      resetGameCore(undefined, flipBoard);
    },
    [resetGameCore],
  );

  const resetGameWithVariant = useCallback(
    (v: GameVariant, flipBoard = false) => {
      resetGameCore(v, flipBoard);
    },
    [resetGameCore],
  );

  const applyMove = useCallback(
    (from: string, to: string): boolean => {
      try {
        const move = game.move({ from, to, promotion: "q" });
        if (move) {
          setFen(game.fen());
          setSelectedSquare("");
          setLastMove({ from, to });
          setViewMoveIndex(null);
          playMoveSound(move, game.inCheck());

          // Variant Checks
          if (variant === "three-check" && game.inCheck()) {
            const nextTurn = game.turn();
            if (nextTurn === "b") {
              setWhiteChecks((c) => {
                const next = c + 1;
                if (next >= 3) {
                  setVariantWinner("w");
                }
                return next;
              });
            } else {
              setBlackChecks((c) => {
                const next = c + 1;
                if (next >= 3) {
                  setVariantWinner("b");
                }
                return next;
              });
            }
          }

          if (variant === "king-of-the-hill") {
            const wKing = getKingSquare(game, "w");
            const bKing = getKingSquare(game, "b");
            if (["d4", "d5", "e4", "e5"].includes(wKing)) {
              setVariantWinner("w");
            } else if (["d4", "d5", "e4", "e5"].includes(bKing)) {
              setVariantWinner("b");
            }
          }

          return true;
        }
      } catch {
      }
      return false;
    },
    [game, variant],
  );

  const recalculateChecks = useCallback((g: Chess) => {
    const history = g.history({ verbose: true });
    let w = 0;
    let b = 0;
    for (const m of history) {
      if (m.san.includes("+") || m.san.includes("#")) {
        if (m.color === "w") {
          w++;
        } else {
          b++;
        }
      }
    }
    setWhiteChecks(w);
    setBlackChecks(b);

    if (w >= 3) {
      setVariantWinner("w");
    } else if (b >= 3) {
      setVariantWinner("b");
    } else {
      let kohWinner: "w" | "b" | null = null;
      if (variant === "king-of-the-hill") {
        const wKing = getKingSquare(g, "w");
        const bKing = getKingSquare(g, "b");
        if (["d4", "d5", "e4", "e5"].includes(wKing)) {
          kohWinner = "w";
        } else if (["d4", "d5", "e4", "e5"].includes(bKing)) {
          kohWinner = "b";
        }
      }
      setVariantWinner(kohWinner);
    }
  }, [variant]);

  const applyUndo = useCallback(() => {
    const undone = game.undo();
    if (undone) {
      setFen(game.fen());
      setSelectedSquare("");
      setViewMoveIndex(null);
      const history = game.history({ verbose: true });
      if (history.length > 0) {
        const last = history[history.length - 1];
        setLastMove({ from: last.from, to: last.to });
      } else {
        setLastMove(null);
      }
      recalculateChecks(game);
      const audio = playSound("/sounds/move.mp3");
    }
  }, [game, recalculateChecks]);

  const isPlayerTurn = useCallback(
    (
      gameMode: GameMode,
      joinedRoom: string,
      playerColor: "w" | "b" | null,
    ): boolean => {
      if (viewMoveIndex !== null) return false;
      if (game.isGameOver()) return false;
      const currentTurn = game.turn();

      if (gameMode === "online") {
        return !!(joinedRoom && playerColor === currentTurn);
      }
      const isAiTurn =
        (gameMode === "computer-black" && currentTurn === "b") ||
        (gameMode === "computer-white" && currentTurn === "w");
      return !isAiTurn;
    },
    [game, viewMoveIndex],
  );

  const executeMove = useCallback(
    (
      from: string,
      to: string,
      gameMode: GameMode,
      joinedRoom: string,
      socket: { emit: (event: string, data: Record<string, string>) => void } | null,
    ): boolean => {
      try {
        const move = game.move({ from, to, promotion: "q" });
        if (move) {
          const nextFen = game.fen();
          setFen(nextFen);
          setSelectedSquare("");
          setLastMove({ from, to });
          playMoveSound(move, game.inCheck());

          if (gameMode === "online" && socket && joinedRoom) {
            socket.emit("makeMove", { room: joinedRoom, from, to, fen: nextFen });
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

  const handlePieceDrop = useCallback(
    (
      sourceSquare: string,
      targetSquare: string,
      gameMode: GameMode,
      joinedRoom: string,
      playerColor: "w" | "b" | null,
      socket: { emit: (event: string, data: Record<string, string>) => void } | null,
    ): boolean => {
      if (!isPlayerTurn(gameMode, joinedRoom, playerColor)) return false;
      return executeMove(sourceSquare, targetSquare, gameMode, joinedRoom, socket);
    },
    [isPlayerTurn, executeMove],
  );

  const handleSquareClick = useCallback(
    (
      square: string,
      gameMode: GameMode,
      joinedRoom: string,
      playerColor: "w" | "b" | null,
      socket: { emit: (event: string, data: Record<string, string>) => void } | null,
    ) => {
      if (!isPlayerTurn(gameMode, joinedRoom, playerColor)) return;

      if (selectedSquare === square) {
        setSelectedSquare("");
        return;
      }

      if (selectedSquare) {
        const moved = executeMove(selectedSquare, square, gameMode, joinedRoom, socket);
        if (moved) return;
      }

      const piece = game.get(square as Square);
      const turn = game.turn();
      if (piece && piece.color === turn) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare("");
      }
    },
    [game, selectedSquare, isPlayerTurn, executeMove],
  );

  const getSquareStyles = useCallback((): SquareStyles => {
    const styles: SquareStyles = {};

    if (lastMove) {
      styles[lastMove.from] = { background: BOARD_THEME.lastMoveColor };
      styles[lastMove.to] = { background: BOARD_THEME.lastMoveColor };
    }

    if (game.inCheck()) {
      const kingSq = getKingSquare(game, game.turn());
      if (kingSq) {
        styles[kingSq] = { background: BOARD_THEME.checkColor };
      }
    }

    if (selectedSquare) {
      styles[selectedSquare] = { background: BOARD_THEME.selectedColor };

      const moves = game.moves({
        square: selectedSquare as Square,
        verbose: true,
      });

      moves.forEach((m) => {
        const isCapture = game.get(m.to as Square);
        styles[m.to] = {
          background: isCapture
            ? BOARD_THEME.captureHintColor
            : BOARD_THEME.moveHintColor,
          cursor: "pointer",
        };
      });
    }

    return styles;
  }, [game, lastMove, selectedSquare]);

  const performUndo = useCallback((): { undone: boolean; prevFrom: string; prevTo: string } => {
    const undone = game.undo();
    if (!undone) return { undone: false, prevFrom: "", prevTo: "" };

    setFen(game.fen());
    setSelectedSquare("");
    setViewMoveIndex(null);

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

    recalculateChecks(game);
    playSound("/sounds/move.mp3");

    return { undone: true, prevFrom, prevTo };
  }, [game, recalculateChecks]);

  const handleUndo = useCallback(
    (
      gameMode: GameMode,
      joinedRoom: string,
      socket: { emit: (event: string, data: Record<string, string>) => void } | null,
    ) => {
      if (game.history().length === 0) return;

      if (gameMode === "online") {
        if (!joinedRoom || !socket) return;
        const { undone, prevFrom, prevTo } = performUndo();
        if (undone) {
          socket.emit("undoMove", {
            room: joinedRoom,
            fen: game.fen(),
            from: prevFrom,
            to: prevTo,
          });
        }
      } else {
        const { undone } = performUndo();
        if (undone) {
          syncFlipState(game.turn(), autoFlip);
        }
      }
    },
    [game, autoFlip, syncFlipState, performUndo],
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
    fen: boardFen,
    selectedSquare,
    lastMove,
    flipped,
    autoFlip,
    capturedWhite,
    capturedBlack,
    turn: game.turn(),
    viewMoveIndex,
    variant,
    whiteChecks,
    blackChecks,
    variantWinner,
    handlePieceDrop,
    handleSquareClick,
    getSquareStyles,
    handleUndo,
    handleReset,
    handleAutoFlipToggle,
    setFlipped,
    resetGame,
    resetGameWithVariant,
    applyMove,
    applyUndo,
    setViewMoveIndex,
    setVariant,
  };
}
