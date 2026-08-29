import { Chess } from "chess.js";
import type { PieceCount } from "../types/game.types";
import { playSound } from "../../../lib/utils";

export function getKingSquare(game: Chess, color: "w" | "b"): string {
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

export function generateChess960FEN(): string {
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

  const rookPositions = pieces.map((p, i) => p === 'R' ? i : -1).filter(i => i !== -1);
  const kingPos = pieces.indexOf('K');
  const files = 'ABCDEFGH';
  let castling = '';
  if (rookPositions[1] > kingPos) castling += files[rookPositions[1]];
  if (rookPositions[0] < kingPos) castling += files[rookPositions[0]];
  castling += castling.toLowerCase();

  return `${blackRow}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRow} w ${castling || '-'} - 0 1`;
}

export function getCapturedPieces(gameInstance: Chess): string[] {
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

export function playMoveSound(moveResult: { captured?: string }, inCheckAfterMove: boolean) {
  let url = "/sounds/move.mp3";
  if (inCheckAfterMove) {
    url = "/sounds/check.mp3";
  } else if (moveResult.captured) {
    url = "/sounds/capture.mp3";
  }
  playSound(url);
}
