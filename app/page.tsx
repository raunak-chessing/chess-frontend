"use client";

import React, { useState } from "react";
import { Chess, Square } from "chess.js";
import Chessboard from "../components/Chessboard";

const getCaptured = (gameInstance: Chess) => {
  const initial = {
    w: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 },
    b: { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 }
  };

  const current = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
  };

  gameInstance.board().forEach(row => {
    row.forEach(square => {
      if (square) {
        current[square.color][square.type as keyof typeof current.w]++;
      }
    });
  });

  const list: string[] = [];
  
  for (const [type, count] of Object.entries(initial.w)) {
    const diff = count - current.w[type as keyof typeof current.w];
    for (let i = 0; i < diff; i++) {
      list.push("w" + type);
    }
  }

  for (const [type, count] of Object.entries(initial.b)) {
    const diff = count - current.b[type as keyof typeof current.b];
    for (let i = 0; i < diff; i++) {
      list.push("b" + type);
    }
  }

  return list;
};

export default function Home() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [fen, setFen] = useState<string>(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [flipped, setFlipped] = useState<boolean>(false);
  const [autoFlip, setAutoFlip] = useState<boolean>(false);

  const getKingSquare = (color: "w" | "b"): string => {
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === "k" && piece.color === color) {
          const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
          const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
          return files[c] + ranks[r];
        }
      }
    }
    return "";
  };

  const playMoveSound = (moveResult: any, inCheckAfterMove: boolean) => {
    let url = "/sounds/move.mp3";
    if (inCheckAfterMove) {
      url = "/sounds/check.mp3";
    } else if (moveResult.captured) {
      url = "/sounds/capture.mp3";
    }
    const audio = new Audio(url);
    audio.play().catch(() => {});
  };

  const syncFlipState = (nextTurn: "w" | "b", isAutoFlipActive: boolean) => {
    if (isAutoFlipActive) {
      setFlipped(nextTurn === "b");
    }
  };

  const handlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q"
      });

      if (move) {
        setFen(game.fen());
        setSelectedSquare("");
        setLastMove({ from: sourceSquare, to: targetSquare });
        playMoveSound(move, game.inCheck());
        syncFlipState(game.turn(), autoFlip);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const handleSquareClick = (square: string) => {
    if (selectedSquare === square) {
      setSelectedSquare("");
      return;
    }

    if (selectedSquare) {
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: "q"
        });

        if (move) {
          setFen(game.fen());
          setSelectedSquare("");
          setLastMove({ from: selectedSquare, to: square });
          playMoveSound(move, game.inCheck());
          syncFlipState(game.turn(), autoFlip);
          return;
        }
      } catch {
      }
    }

    const piece = game.get(square as Square);
    const turn = game.turn();
    if (piece && piece.color === turn) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare("");
    }
  };

  const getSquareStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};

    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(186, 202, 43, 0.4)" };
      styles[lastMove.to] = { backgroundColor: "rgba(186, 202, 43, 0.4)" };
    }

    if (game.inCheck()) {
      const kingSq = getKingSquare(game.turn());
      if (kingSq) {
        styles[kingSq] = { backgroundColor: "rgba(239, 68, 68, 0.55)" };
      }
    }

    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: "rgba(255, 255, 0, 0.4)" };
      
      const moves = game.moves({
        square: selectedSquare as Square,
        verbose: true
      });

      moves.forEach((m) => {
        styles[m.to] = {
          background: game.get(m.to as Square)
            ? "radial-gradient(circle, transparent 70%, rgba(239, 68, 68, 0.55) 75%)"
            : "radial-gradient(circle, rgba(0, 0, 0, 0.15) 20%, transparent 25%)"
        };
      });
    }

    return styles;
  };

  const handleAutoFlipToggle = (checked: boolean) => {
    setAutoFlip(checked);
    if (checked) {
      setFlipped(game.turn() === "b");
    }
  };

  const handleUndo = () => {
    if (game.history().length > 0) {
      const undone = game.undo();
      if (undone) {
        setFen(game.fen());
        setSelectedSquare("");

        const history = game.history({ verbose: true });
        if (history.length > 0) {
          const last = history[history.length - 1];
          setLastMove({ from: last.from, to: last.to });
        } else {
          setLastMove(null);
        }

        syncFlipState(game.turn(), autoFlip);
        const audio = new Audio("/sounds/move.mp3");
        audio.play().catch(() => {});
      }
    }
  };

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setSelectedSquare("");
    setLastMove(null);
    if (autoFlip) {
      setFlipped(false);
    }
  };

  const turn = game.turn();
  const captured = getCaptured(game);
  const capturedWhite = captured.filter(p => p.startsWith("w") && p !== "wk");
  const capturedBlack = captured.filter(p => p.startsWith("b") && p !== "bk");

  const pieceSymbols: Record<string, string> = {
    wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕",
    bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛"
  };

  const getStatusText = (): string => {
    if (game.isCheckmate()) {
      return `Checkmate! ${turn === "w" ? "Black" : "White"} wins.`;
    }
    if (game.isDraw()) {
      return "Draw! Game over.";
    }
    if (game.inCheck()) {
      return `${turn === "w" ? "White" : "Black"}'s Turn - CHECK!`;
    }
    return `${turn === "w" ? "White" : "Black"}'s Turn`;
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 md:p-8 text-zinc-100 font-sans">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 md:p-6 rounded-2xl shadow-2xl">
          
          <div className="w-full flex items-center justify-between mb-4 px-1 max-w-[692px]">
            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${turn === "w" ? "bg-white border border-zinc-400" : "bg-black border border-zinc-700"} ${game.isGameOver() ? "" : "animate-pulse"}`} />
              <span className="text-sm font-semibold tracking-wide text-zinc-300">
                {getStatusText()}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-4 w-full justify-center">
            
            <div className="flex flex-row lg:flex-col items-center justify-start gap-1 p-2 bg-slate-950/40 rounded-xl  w-full lg:w-20 lg:h-[560px] min-h-[44px] overflow-y-auto">
              {capturedWhite.length === 0 ? (
                <span className="text-[10px] text-slate-600 italic lg:py-4"></span>
              ) : (
                capturedWhite.map((p, idx) => (
                  <span key={idx} className="text-3xl drop-shadow-md select-none text-zinc-100">{pieceSymbols[p]}</span>
                ))
              )}
            </div>

            <Chessboard
              position={fen}
              flipped={flipped}
              onPieceDrop={handlePieceDrop}
              squareStyles={getSquareStyles()}
              onSquareClick={handleSquareClick}
            />

            <div className="flex flex-row lg:flex-col items-center justify-start gap-1 p-2 bg-slate-950/40 rounded-xl  w-full lg:w-20 lg:h-[560px] min-h-[44px] overflow-y-auto">
              {capturedBlack.length === 0 ? (
                <span className="text-[10px] text-slate-600 italic lg:py-4"></span>
              ) : (
                capturedBlack.map((p, idx) => (
                  <span key={idx} className="text-3xl drop-shadow-md select-none text-zinc-950">{pieceSymbols[p]}</span>
                ))
              )}
            </div>

          </div>

        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 w-full">
          
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">Settings & Controls</h2>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-zinc-300 cursor-pointer hover:text-zinc-150 transition-colors bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <input
                  type="checkbox"
                  checked={autoFlip}
                  onChange={(e) => handleAutoFlipToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                Auto-Flip Board on Turn
              </label>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleUndo}
                  disabled={game.history().length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-98 border border-slate-700 hover:border-slate-650 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200"
                >
                  ↩️ Undo Move
                </button>
                <button
                  onClick={() => setFlipped(!flipped)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-750 active:scale-98 border border-slate-700 hover:border-slate-650 transition-all cursor-pointer text-zinc-200"
                >
                  🔄 Flip Board
                </button>
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-550 active:scale-98 text-white transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                >
                  🆕 Reset Match
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
