"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { usePuzzleBattleSocket } from "../../../features/puzzles/hooks/usePuzzleBattleSocket";
import { PuzzleSolver } from "../../../features/puzzles/components/PuzzleSolver";
import { StrikeTracker } from "../../../features/puzzles/components/StrikeTracker";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function PuzzleBattlePage() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  
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
  } = usePuzzleBattleSocket(user?.id || "", (user as any)?.ratingPuzzle || 1000, user?.name || "Guest");

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((startTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setCountdown(null);
          clearInterval(interval);
        } else {
          setCountdown(remaining);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const handleSolve = () => {
    if (!roomId) return;
    const puzzle = puzzles[currentPuzzleIndex];
    if (puzzle) {
      puzzleSolved(puzzle.id);
    }
    setTimeout(() => {
      setCurrentPuzzleIndex(prev => prev + 1);
    }, 500);
  };

  const handleFail = () => {
    if (!roomId) return;
    const puzzle = puzzles[currentPuzzleIndex];
    if (puzzle) {
      puzzleFailed(puzzle.id);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-80px)]">
        <p className="text-zinc-400">Please log in to play Puzzle Battle.</p>
      </div>
    );
  }

  const myPlayer = players[user.id];
  const opponent = Object.values(players).find(p => p.id !== user.id);
  const currentPuzzle = puzzles[currentPuzzleIndex];

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 h-full overflow-y-auto">
      <div className="flex justify-between w-full max-w-[1100px] mb-8">
        <Link href="/puzzles" className="text-zinc-400 hover:text-white transition-colors" onClick={leaveQueue}>
          ← Back to Puzzles
        </Link>
        <div className="text-xl font-bold font-serif text-white">
          Puzzle Battle
        </div>
      </div>

      {!roomId && !inQueue && !isBattleOver && (
        <div className="w-full max-w-[600px] bg-cc-bg-card p-10 rounded-2xl border border-cc-border shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center text-4xl mb-6">
            ⚔️
          </div>
          <h2 className="text-3xl font-serif font-extrabold text-white mb-2">Ready for Battle?</h2>
          <p className="text-zinc-400 mb-8">Race head-to-head against an opponent. First to 3 strikes loses.</p>
          <button
            onClick={joinQueue}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-blue-900/50 hover:-translate-y-1"
          >
            Find Opponent
          </button>
        </div>
      )}

      {inQueue && !roomId && (
        <div className="w-full max-w-[600px] bg-cc-bg-card p-10 rounded-2xl border border-cc-border shadow-2xl flex flex-col items-center text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-6" />
          <h2 className="text-2xl font-serif font-extrabold text-white mb-2">Searching for Opponent...</h2>
          <p className="text-zinc-400 mb-8">Matching you with a player of similar rating.</p>
          <button
            onClick={leaveQueue}
            className="px-6 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      )}

      {roomId && countdown !== null && (
        <div className="w-full max-w-[800px] bg-cc-bg-card p-10 rounded-2xl border border-cc-border shadow-2xl flex flex-col items-center text-center">
          <h2 className="text-3xl font-serif font-extrabold text-white mb-8">Match Found!</h2>
          <div className="flex justify-between items-center w-full max-w-md mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full mb-2 border-2 border-cc-green"></div>
              <span className="font-bold">{myPlayer?.name}</span>
              <span className="text-xs text-zinc-500">{myPlayer?.rating}</span>
            </div>
            <div className="text-2xl font-black text-zinc-600 italic">VS</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full mb-2 border-2 border-red-500"></div>
              <span className="font-bold">{opponent?.name}</span>
              <span className="text-xs text-zinc-500">{opponent?.rating}</span>
            </div>
          </div>
          <div className="text-6xl font-mono font-black text-blue-500 animate-pulse">
            {countdown}
          </div>
        </div>
      )}

      {roomId && countdown === null && !isBattleOver && (
        <div className="w-full max-w-[1100px] flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cc-bg-card p-4 rounded-xl border border-cc-border flex justify-between items-center shadow-lg">
              <div className="flex flex-col">
                <span className="text-xs text-cc-green font-bold uppercase">You</span>
                <span className="font-serif font-bold text-white text-lg">{myPlayer?.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Score</span>
                  <span className="text-2xl font-mono font-black text-cc-green">{myPlayer?.score || 0}</span>
                </div>
                <StrikeTracker strikes={myPlayer?.strikes || 0} />
              </div>
            </div>

            <div className="bg-cc-bg-card p-4 rounded-xl border border-cc-border flex justify-between items-center shadow-lg opacity-80">
              <div className="flex flex-col">
                <span className="text-xs text-red-500 font-bold uppercase">Opponent</span>
                <span className="font-serif font-bold text-white text-lg">{opponent?.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Score</span>
                  <span className="text-2xl font-mono font-black text-white">{opponent?.score || 0}</span>
                </div>
                <StrikeTracker strikes={opponent?.strikes || 0} />
              </div>
            </div>
          </div>

          <PuzzleSolver
            puzzle={currentPuzzle}
            onSolve={handleSolve}
            onFail={handleFail}
            showNextButton={false}
          />
        </div>
      )}

      {isBattleOver && (
        <div className="w-full max-w-[800px] bg-cc-bg-card p-10 rounded-2xl border border-cc-border shadow-2xl flex flex-col items-center text-center">
          <h2 className="text-5xl font-serif font-extrabold text-white mb-2">Battle Over</h2>
          <p className="text-zinc-400 mb-8 capitalize">{endReason?.replace(/_/g, " ")}</p>

          <div className="flex justify-center gap-12 w-full max-w-md mb-8">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold mb-2">{myPlayer?.name}</span>
              <span className="text-4xl font-mono font-black text-cc-green mb-2">{myPlayer?.score}</span>
              <StrikeTracker strikes={myPlayer?.strikes || 0} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold mb-2">{opponent?.name}</span>
              <span className="text-4xl font-mono font-black text-zinc-300 mb-2">{opponent?.score}</span>
              <StrikeTracker strikes={opponent?.strikes || 0} />
            </div>
          </div>

          <div className="flex gap-4">
             <button
               onClick={joinQueue}
               className="px-6 py-3 font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg"
             >
               Play Again
             </button>
             <Link
               href="/puzzles"
               className="px-6 py-3 font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-all"
             >
               Exit
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
