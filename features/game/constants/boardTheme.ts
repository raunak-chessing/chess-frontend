export interface BoardSkin {
  lightSquareGradient: string;
  darkSquareGradient: string;
  boardShadow: string;
}

export const DEFAULT_BOARD_SKIN: BoardSkin = {
  lightSquareGradient: "radial-gradient(circle at center, #f5e4d2 0%, #dbbfab 100%)",
  darkSquareGradient: "radial-gradient(circle at center, #4d453f 0%, #2f2723 100%)",
  boardShadow: "inset 0 0 10px rgba(0, 0, 0, 0.75)",
};

export const BOARD_SKINS: Record<string, BoardSkin> = {
  "board-classic-wood": DEFAULT_BOARD_SKIN,
  "board-obsidian": {
    lightSquareGradient: "radial-gradient(circle at center, #33333d 0%, #1c1c22 100%)",
    darkSquareGradient: "radial-gradient(circle at center, #121215 0%, #08080a 100%)",
    boardShadow: "inset 0 0 14px rgba(0, 0, 0, 0.85), 0 0 20px rgba(212, 175, 55, 0.15)",
  },
  "board-aetherium-glass": {
    lightSquareGradient: "radial-gradient(circle at center, #c5ecf7 0%, #8fc9dc 100%)",
    darkSquareGradient: "radial-gradient(circle at center, #24405a 0%, #14202e 100%)",
    boardShadow: "inset 0 0 16px rgba(80, 200, 255, 0.35)",
  },
};

export const BOARD_THEME = {
  ...DEFAULT_BOARD_SKIN,
  lastMoveColor: "rgba(186, 202, 43, 0.42)",
  checkColor: "rgba(239, 68, 68, 0.55)",
  selectedColor: "rgba(255, 255, 0, 0.38)",
  moveHintColor: "radial-gradient(circle, rgba(0, 0, 0, 0.25) 24%, transparent 25%)",
  captureHintColor: "radial-gradient(circle, transparent 55%, rgba(0, 0, 0, 0.25) 56%, rgba(0, 0, 0, 0.25) 68%, transparent 69%)",
} as const;
