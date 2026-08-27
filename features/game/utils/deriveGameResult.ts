import type { Chess } from "chess.js";
import type { GameMode, GameVariant } from "../types/game.types";

export type GameResult = "won" | "lost" | "draw" | "opponent-disconnected" | "opponent-resigned" | null;

export function deriveGameResult(params: {
  localResult: GameResult;
  variantWinner: "w" | "b" | null;
  game: Chess;
  gameMode: GameMode;
  playerColor: "w" | "b" | "s" | null;
}): GameResult {
  const { localResult, variantWinner, game, gameMode, playerColor } = params;
  let derivedResult = localResult;

  if (!derivedResult && variantWinner !== null) {
    if (gameMode === "online") {
      derivedResult = playerColor === variantWinner ? "won" : "lost";
    } else if (gameMode === "computer-black") {
      derivedResult = variantWinner === "w" ? "won" : "lost";
    } else if (gameMode === "computer-white") {
      derivedResult = variantWinner === "b" ? "won" : "lost";
    } else {
      derivedResult = variantWinner === "w" ? "won" : "lost";
    }
  }

  if (!derivedResult && game.isGameOver()) {
    if (game.isCheckmate()) {
      const turn = game.turn();
      if (gameMode === "online") {
        derivedResult = playerColor === turn ? "lost" : "won";
      } else if (gameMode === "computer-black") {
        derivedResult = turn === "b" ? "won" : "lost";
      } else if (gameMode === "computer-white") {
        derivedResult = turn === "w" ? "won" : "lost";
      } else {
        derivedResult = turn === "w" ? "lost" : "won";
      }
    } else if (game.isDraw()) {
      derivedResult = "draw";
    }
  }

  return derivedResult;
}

export interface OverlayConfig {
  title: string;
  description: string;
  bgClass: string;
  buttonClass: string;
}

export function getOverlayConfig(params: {
  showOverlay: boolean;
  derivedResult: GameResult;
  variantWinner: "w" | "b" | null;
  variant: GameVariant;
  gameMode: GameMode;
  playerColor: "w" | "b" | "s" | null;
}): OverlayConfig | null {
  const { showOverlay, derivedResult, variantWinner, variant, gameMode, playerColor } = params;
  if (!showOverlay) return null;

  let title = "🎉 Victory!";
  let description = "You won the match!";

  if (variantWinner !== null) {
    const vName = variant === "three-check" ? "Three-Check" : "King of the Hill";
    const winnerColorName = variantWinner === "w" ? "White" : "Black";
    if (gameMode === "pvp") {
      title = `🎉 ${winnerColorName} Wins!`;
      description = `${vName} objective completed!`;
    } else {
      const didIWin = gameMode === "online"
        ? playerColor === variantWinner
        : (gameMode === "computer-black" ? variantWinner === "w" : variantWinner === "b");
      if (didIWin) {
        title = "🎉 Victory!";
        description = `You completed the ${vName} goal!`;
      } else {
        title = "🏳️ Defeat";
        description = `Your opponent completed the ${vName} goal.`;
      }
    }
  } else {
    if (derivedResult === "lost") {
      title = "🏳️ Defeat";
      description = "You lost this match.";
    } else if (derivedResult === "draw") {
      title = "🤝 Draw";
      description = "The game ended in a draw.";
    } else if (derivedResult === "opponent-disconnected") {
      title = "🔌 Opponent Disconnected";
      description = "Your opponent left the game.";
    } else if (derivedResult === "opponent-resigned") {
      title = "🎉 Victory by Resignation!";
      description = "Your opponent resigned.";
    }
  }

  switch (derivedResult) {
    case "won":
    case "opponent-resigned":
      return {
        title,
        description,
        bgClass: "bg-cc-bg-sidebar/95 border-cc-border-hover/20 text-cc-text-primary font-serif",
        buttonClass: "bg-emerald-700 hover:bg-emerald-600 text-white",
      };
    case "lost":
      return {
        title,
        description,
        bgClass: "bg-cc-bg-sidebar/95 border-cc-border-hover/20 text-cc-text-primary font-serif",
        buttonClass: "bg-red-900 hover:bg-red-800 text-red-100",
      };
    case "draw":
      return {
        title,
        description,
        bgClass: "bg-[var(--cc-bg-card)] border-[var(--cc-border-light)] text-[var(--cc-text-primary)] font-sans",
        buttonClass: "bg-[var(--cc-bg-input)] hover:bg-[var(--cc-bg-hover)] text-white",
      };
    case "opponent-disconnected":
      return {
        title,
        description,
        bgClass: "bg-[var(--cc-bg-card)] border-[var(--cc-border-light)] text-[var(--cc-text-primary)] font-sans",
        buttonClass: "bg-amber-700 hover:bg-amber-600 text-white",
      };
    default:
      return null;
  }
}
