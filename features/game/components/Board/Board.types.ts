import type { SquareStyles } from "../../types/game.types";

export interface BoardProps {
  position: string;
  flipped: boolean;
  viewMode?: "3d" | "2.5d" | "2d";
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  squareStyles: SquareStyles;
  onSquareClick: (square: string) => void;
}
