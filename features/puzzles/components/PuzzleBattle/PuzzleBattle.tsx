"use client";

import { useEffect, useState, useCallback } from "react";
import { Chess } from "chess.js";
import { Board } from "../../../game/components/Board";
import { usePuzzleBattleSocket } from "../../hooks/usePuzzleBattleSocket";
import { playSound } from "../../../../lib/utils";
import { authClient } from "../../../../lib/auth-client";

export function PuzzleBattle({ onReturnHome }: { onReturnHome: () => void }) {
  const { data: session } = authClient.useSession();
  
  const {
    inQueue,
    roomId,
    puzzles,
    players,
    startTime,
    isBattleOver,
    endReason,
    joinQueue,
    leaveQueue,
    puzzleSolved,
    puzzleFailed,
  } = usePuzzleBattleSocket(
    session?.user?.id || "guest", 
    1500, // Default rating if we don't have user's puzzle rating mapped directly
    session?.user?.name || "Guest"
  );

  const [localChess, setLocalChess] = useState<Chess>(new Chess());
  const [boardPosition, setBoardPosition] = useState<string>("start");
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  
  const currentPuzzle = puzzles[currentPuzzleIdx];

  // Load new puzzle when index changes
  useEffect(() => {
    if (currentPuzzle) {
      const c = new Chess(currentPuzzle.fen);
      setLocalChess(c);
      setBoardPosition(currentPuzzle.fen);
      setCurrentMoveIdx(0);
    }
  }, [currentPuzzle]);

  const handlePieceDrop = useCallback((source: string, target: string): boolean => {
    if (isBattleOver || !currentPuzzle) return false;

    const moveStr = `${source}${target}`;
    const correctMove = currentPuzzle.moves[currentMoveIdx];

    if (moveStr === correctMove) {
      try {
        const move = localChess.move({ from: source, to: target, promotion: "q" });
        if (move) {
          setBoardPosition(localChess.fen());
          const nextIdx = currentMoveIdx + 1;
          playSound("/sounds/move.mp3");

          if (nextIdx >= currentPuzzle.moves.length) {
            // Solved completely!
            playSound("/sounds/capture.mp3");
            puzzleSolved(currentPuzzle.id);
            setCurrentPuzzleIdx(prev => prev + 1);
          } else {
            setCurrentMoveIdx(nextIdx);
            
            // Opponent response
            const nextTurn = localChess.turn();
            const isOpponentTurn = (currentPuzzle.fen.split(' ')[1] !== nextTurn);
            
            if (isOpponentTurn && nextIdx < currentPuzzle.moves.length) {
                setTimeout(() => {
                    const oppMoveStr = currentPuzzle.moves[nextIdx];
                    const oppSource = oppMoveStr.substring(0, 2);
                    const oppTarget = oppMoveStr.substring(2, 4);
                    localChess.move({ from: oppSource, to: oppTarget, promotion: "q" });
                    setBoardPosition(localChess.fen());
                    playSound("/sounds/move.mp3");
                    
                    const nextNextIdx = nextIdx + 1;
                    setCurrentMoveIdx(nextNextIdx);
                    
                    if (nextNextIdx >= currentPuzzle.moves.length) {
                        playSound("/sounds/capture.mp3");
                        puzzleSolved(currentPuzzle.id);
                        setCurrentPuzzleIdx(prev => prev + 1);
                    }
                }, 300);
            }
          }
          return true;
        }
      } catch (err) {
        // Fall through
      }
    }

    // Incorrect Move
    playSound("/sounds/check.mp3");
    puzzleFailed(currentPuzzle.id);
    setCurrentPuzzleIdx(prev => prev + 1); // Move to next puzzle even if failed
    
    return false;
  }, [currentPuzzle, isBattleOver, currentMoveIdx, localChess, puzzleSolved, puzzleFailed]);

  // Derive opponent
  const myPlayer = session?.user?.id ? players[session.user.id] : Object.values(players)[0];
  const oppPlayer = Object.values(players).find(p => p.id !== myPlayer?.id);

  if (!roomId && !inQueue) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white gap-6">
        <h2 className="text-4xl font-extrabold font-serif">Puzzle Battle</h2>
        <p className="text-zinc-400 max-w-md text-center">
          Race against another player to solve as many puzzles as you can. 
          3 strikes and you're out. First to strike out, or whoever has the most points when time runs out, wins!
        </p>
        <button
          onClick={joinQueue}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          Find Opponent
        </button>
        <button
          onClick={onReturnHome}
          className="px-6 py-2 bg-transparent text-zinc-400 hover:text-white"
        >
          Back
        </button>
      </div>
    );
  }

  if (inQueue) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white gap-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-2xl font-bold font-serif animate-pulse">Searching for opponent...</h2>
        <button
          onClick={leaveQueue}
          className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-all mt-4"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1100px] mx-auto p-4 bg-cc-bg-page rounded-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: My Progress */}
        <div className="lg:col-span-2 flex flex-col justify-end items-center pb-8 gap-4 order-2 lg:order-1">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">{myPlayer?.name || "You"}</span>
            <span className="text-3xl font-black text-blue-400">{myPlayer?.score || 0}</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full ${i <= (myPlayer?.strikes || 0) ? 'bg-red-500' : 'bg-zinc-700'}`}></div>
              ))}
            </div>
          </div>
          {/* A simple progress bar going up */}
          <div className="w-4 h-64 bg-zinc-800 rounded-full overflow-hidden flex flex-col justify-end border border-zinc-700">
             <div 
               className="w-full bg-blue-500 transition-all duration-300"
               style={{ height: `${Math.min(100, ((myPlayer?.score || 0) / 40) * 100)}%` }}
             ></div>
          </div>
        </div>

        {/* Center: Board */}
        <div className="lg:col-span-8 flex justify-center order-1 lg:order-2 relative">
          <div className="w-full max-w-[620px] aspect-square relative rounded-2xl overflow-hidden border border-cc-border shadow-xl">
            <Board
              position={boardPosition}
              flipped={currentPuzzle?.fen.includes(" w ") ? false : true}
              viewMode="2d"
              onPieceDrop={handlePieceDrop}
              squareStyles={{}}
              onSquareClick={() => {}}
            />

            {isBattleOver && (
              <div className="absolute inset-0 bg-cc-bg-page/90 backdrop-blur-sm flex flex-col justify-center items-center gap-4 text-center z-50">
                <span className="text-3xl font-serif font-extrabold uppercase text-white">
                  Battle Over
                </span>
                <span className="text-lg text-zinc-300">
                  {endReason}
                </span>
                
                <div className="flex gap-8 mt-6">
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-zinc-400">{myPlayer?.name}</span>
                    <span className="text-4xl font-black text-blue-400">{myPlayer?.score || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-zinc-400">{oppPlayer?.name}</span>
                    <span className="text-4xl font-black text-red-400">{oppPlayer?.score || 0}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={joinQueue}
                    className="px-6 py-3 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={onReturnHome}
                    className="px-6 py-3 text-sm font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-all border border-zinc-700"
                  >
                    Exit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Opponent Progress */}
        <div className="lg:col-span-2 flex flex-col justify-end items-center pb-8 gap-4 order-3 lg:order-3">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-white">{oppPlayer?.name || "Opponent"}</span>
            <span className="text-3xl font-black text-red-400">{oppPlayer?.score || 0}</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full ${i <= (oppPlayer?.strikes || 0) ? 'bg-red-500' : 'bg-zinc-700'}`}></div>
              ))}
            </div>
          </div>
          <div className="w-4 h-64 bg-zinc-800 rounded-full overflow-hidden flex flex-col justify-end border border-zinc-700">
             <div 
               className="w-full bg-red-500 transition-all duration-300"
               style={{ height: `${Math.min(100, ((oppPlayer?.score || 0) / 40) * 100)}%` }}
             ></div>
          </div>
        </div>

      </div>
    </div>
  );
}
