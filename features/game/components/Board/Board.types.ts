import type { SquareStyles } from "../../types/game.types";
import type { BoardSkin } from "../../constants/boardTheme";

export interface BoardProps {
  position: string;
  flipped?: boolean;
  onPieceDrop: (sourceSquare: string, targetSquare: string, piece: string) => boolean;
  squareStyles?: Record<string, React.CSSProperties>;
  onSquareClick?: (square: string) => void;
  premove?: [string, string] | null;
  onPremoveClear?: () => void;
  isDraggablePiece?: (args: { piece: string; sourceSquare: string }) => boolean;
  skin?: BoardSkin;
}
