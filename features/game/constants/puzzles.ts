export interface ChessPuzzle {
  id: string;
  title: string;
  description: string;
  fen: string;
  turn: "w" | "b";
  moves: string[]; // move coordinates format, e.g. ["e2e4", "g8f6"]
  opponentMoves: string[]; // opponent automatic replies, e.g. ["e7e5"]
}

export const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: "1",
    title: "Scholar's Mate",
    description: "White to move. Deliver the checkmate in 1 move.",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1KBNR w KQkq - 4 4",
    turn: "w",
    moves: ["f3f7"],
    opponentMoves: [],
  },
  {
    id: "2",
    title: "Back Rank Defeat",
    description: "White to move. Find the back-rank checkmate.",
    fen: "6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1",
    turn: "w",
    moves: ["d1d8"],
    opponentMoves: [],
  },
  {
    id: "3",
    title: "The Smothered Mate",
    description: "White to move. Deliver the smothered mate.",
    fen: "6rk/5ppp/7N/8/8/8/8/7K w - - 0 1",
    turn: "w",
    moves: ["h6f7"],
    opponentMoves: [],
  },
  {
    id: "4",
    title: "Knight Fork",
    description: "White to move. Fork the black King and Queen.",
    fen: "q3k3/8/8/4N3/8/8/8/4K3 w - - 0 1",
    turn: "w",
    moves: ["e5c7"],
    opponentMoves: [],
  },
  {
    id: "5",
    title: "Anastasia's Hook",
    description: "White to move. Deliver checkmate on the h-file.",
    fen: "7k/4Nppp/8/8/8/8/1R3PPP/6K1 w - - 0 1",
    turn: "w",
    moves: ["b2b8"],
    opponentMoves: [],
  }
];
