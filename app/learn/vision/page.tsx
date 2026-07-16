"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "../../../components/ui/Card";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

export default function VisionTrainerPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [targetSquare, setTargetSquare] = useState<string | null>(null);
  const [feedbackSquare, setFeedbackSquare] = useState<{ square: string, correct: boolean } | null>(null);
  const [showCoords, setShowCoords] = useState(false);
  const [isWhiteBottom, setIsWhiteBottom] = useState(true);

  const getRandomSquare = useCallback(() => {
    const f = FILES[Math.floor(Math.random() * 8)];
    const r = RANKS[Math.floor(Math.random() * 8)];
    return `${f}${r}`;
  }, []);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(30);
    setScore(0);
    setTargetSquare(getRandomSquare());
    setFeedbackSquare(null);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setTargetSquare(null);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handleSquareClick = (square: string) => {
    if (!isPlaying) return;

    if (square === targetSquare) {
      setScore((s) => s + 1);
      setFeedbackSquare({ square, correct: true });
      setTargetSquare(getRandomSquare());
    } else {
      setFeedbackSquare({ square, correct: false });
    }

    setTimeout(() => {
      setFeedbackSquare(null);
    }, 300);
  };

  const getRenderRanks = () => isWhiteBottom ? RANKS : [...RANKS].reverse();
  const getRenderFiles = () => isWhiteBottom ? FILES : [...FILES].reverse();

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 h-full overflow-y-auto">
      <div className="flex justify-between w-full max-w-[1000px] mb-6">
        <Link href="/learn" className="text-zinc-400 hover:text-white transition-colors">
          ← Back to Academy
        </Link>
        <div className="text-xl font-bold font-serif text-white">
          Vision Trainer
        </div>
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-[500px] aspect-square flex flex-col border-2 border-cc-border rounded-lg overflow-hidden shadow-2xl bg-zinc-800">
            {getRenderRanks().map((rank, rIdx) => (
              <div key={rank} className="flex flex-1">
                {getRenderFiles().map((file, fIdx) => {
                  const square = `${file}${rank}`;
                  const isLight = (rIdx + fIdx) % 2 === 0;
                  const isFeedback = feedbackSquare?.square === square;
                  
                  let bgColor = isLight ? "bg-[#ebecd0]" : "bg-[#739552]";
                  if (isFeedback) {
                    bgColor = feedbackSquare?.correct ? "bg-cc-green" : "bg-red-500";
                  }

                  return (
                    <div
                      key={file}
                      onClick={() => handleSquareClick(square)}
                      className={`flex-1 relative cursor-pointer flex items-center justify-center transition-colors duration-100 ${bgColor}`}
                    >
                      {/* Optional Coords */}
                      {showCoords && rIdx === 7 && (
                        <span className={`absolute bottom-0.5 right-1 text-[10px] font-bold ${isLight ? "text-[#739552]" : "text-[#ebecd0]"}`}>
                          {file}
                        </span>
                      )}
                      {showCoords && fIdx === 0 && (
                        <span className={`absolute top-0.5 left-1 text-[10px] font-bold ${isLight ? "text-[#739552]" : "text-[#ebecd0]"}`}>
                          {rank}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="p-8 rounded-3xl border border-cc-border bg-cc-bg-card shadow-xl flex flex-col text-center items-center h-full">
            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-blue-500/30">
              👁️
            </div>
            <h2 className="text-2xl font-serif font-extrabold text-white mb-2">Board Vision</h2>
            <p className="text-sm text-zinc-400 mb-8 max-w-xs">
              Find the target square as fast as possible. Grandmasters don't need coordinates — they see the board natively.
            </p>

            <div className="flex gap-4 w-full mb-8">
              <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-4 flex flex-col items-center justify-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Time</span>
                <span className={`text-3xl font-mono font-black ${timeLeft <= 10 && timeLeft > 0 ? "text-red-500 animate-pulse" : "text-white"}`}>
                  0:{timeLeft.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex-1 bg-zinc-900 rounded-xl border border-zinc-800 p-4 flex flex-col items-center justify-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Score</span>
                <span className="text-3xl font-mono font-black text-cc-green">
                  {score}
                </span>
              </div>
            </div>

            {isPlaying ? (
              <div className="w-full flex flex-col items-center bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl mb-4">
                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Find Square</span>
                <span className="text-6xl font-mono font-black text-white">{targetSquare}</span>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center mt-auto">
                {score > 0 && (
                   <p className="text-lg font-bold text-white mb-4">You scored <span className="text-cc-green">{score}</span>!</p>
                )}
                <button
                  onClick={startGame}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg hover:-translate-y-1 mb-4"
                >
                  {score > 0 ? "Play Again" : "Start Trainer"}
                </button>
              </div>
            )}

            <div className="flex gap-4 mt-auto w-full">
               <button 
                 onClick={() => setShowCoords(!showCoords)}
                 className="flex-1 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-all"
               >
                 {showCoords ? "Hide Coords" : "Show Coords"}
               </button>
               <button 
                 onClick={() => setIsWhiteBottom(!isWhiteBottom)}
                 className="flex-1 py-2 text-xs font-bold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-all"
               >
                 Flip Board
               </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
