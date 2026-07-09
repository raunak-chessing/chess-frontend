import type { SquareStyles } from "../../types/game.types";

export interface BoardProps {
  position: string;
  flipped: boolean;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  squareStyles: SquareStyles;
  onSquareClick: (square: string) => void;
}
