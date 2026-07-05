"use client";

import React, { useState } from "react";
import { Chess } from "chess.js";
import Chessboard from "../components/Chessboard";

export default function Home() {
  const [game] = useState<Chess>(new Chess());
  const [fen, setFen] = useState<string>(game.fen());

  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q"
      });

      if (move) {
        setFen(game.fen());
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  return (
    <main className="w-screen bg-slate-950 flex items-center justify-center p-4 md:p-8">
      <Chessboard
        position={fen}
        flipped={false}
        onPieceDrop={handlePieceDrop}
      />
    </main>
  );
}
