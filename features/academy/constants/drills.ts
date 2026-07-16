export interface Drill {
  id: string;
  title: string;
  category: "Endgame" | "Checkmate" | "Defense";
  description: string;
  fen: string;
  playerColor: "w" | "b";
}

export const DRILLS: Drill[] = [
  {
    id: "mate-2-bishops",
    title: "Mate with Two Bishops",
    category: "Checkmate",
    description: "Use your two bishops and king to force the enemy king to the corner and deliver checkmate.",
    fen: "8/8/8/8/3k4/8/2B1B3/3K4 w - - 0 1",
    playerColor: "w",
  },
  {
    id: "mate-rook",
    title: "Mate with a Rook",
    category: "Checkmate",
    description: "Cut off the enemy king's ranks with your rook and bring your king closer to deliver mate.",
    fen: "8/8/8/3k4/8/8/3R4/3K4 w - - 0 1",
    playerColor: "w",
  },
  {
    id: "lucena-position",
    title: "Lucena Position (Win)",
    category: "Endgame",
    description: "The most important rook endgame. Build a bridge with your rook to shelter your king from checks and promote the pawn.",
    fen: "1K6/1P6/8/8/5r2/8/8/1R5k w - - 0 1",
    playerColor: "w",
  },
  {
    id: "philidor-position",
    title: "Philidor Position (Draw)",
    category: "Defense",
    description: "Defend against a rook and pawn. Keep your rook on the 3rd rank until the pawn advances, then move to the 8th rank to deliver checks from behind.",
    fen: "8/3k4/R7/3PK3/8/8/8/6r1 b - - 0 1",
    playerColor: "b",
  },
  {
    id: "knight-vs-pawn",
    title: "Knight vs Pawn",
    category: "Defense",
    description: "Stop the pawn from promoting using only your knight and king.",
    fen: "8/8/8/3P4/8/8/1n6/1k5K b - - 0 1",
    playerColor: "b",
  }
];
