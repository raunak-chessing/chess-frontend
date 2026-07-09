import type React from "react";

export type GameMode = "pvp" | "computer-black" | "computer-white" | "online";
export type ViewState = "home" | "play";
export type PlayerColor = "w" | "b";

export interface LastMove {
  from: string;
  to: string;
}

export type SquareStyles = Record<string, React.CSSProperties>;

export interface PieceCount {
  p: number;
  n: number;
  b: number;
  r: number;
  q: number;
  k: number;
}

export const PIECE_SYMBOLS: Record<string, string> = {
  wp: "♙",
  wn: "♘",
  wb: "♗",
  wr: "♖",
  wq: "♕",
  bp: "♟",
  bn: "♞",
  bb: "♝",
  br: "♜",
  bq: "♛",
};
