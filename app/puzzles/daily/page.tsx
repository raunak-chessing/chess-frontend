"use client";

import { useEffect, useState } from "react";
import { usePuzzlesStore } from "../../../features/puzzles/store/puzzlesStore";
import { PuzzleSolver } from "../../../features/puzzles/components/PuzzleSolver";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function DailyPuzzlePage() {
  const { 
    currentDailyPuzzle, 
    dailyPuzzleComments, 
    fetchDailyPuzzle, 
    fetchDailyPuzzleComments, 
    addDailyPuzzleComment, 
    isLoading 
  } = usePuzzlesStore();

  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    fetchDailyPuzzle();
  }, [fetchDailyPuzzle]);

  useEffect(() => {
    if (currentDailyPuzzle) {
      fetchDailyPuzzleComments(currentDailyPuzzle.id);
    }
  }, [currentDailyPuzzle, fetchDailyPuzzleComments]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !currentDailyPuzzle) return;
    addDailyPuzzleComment(currentDailyPuzzle.id, commentInput);
    setCommentInput("");
  };

  if (isLoading && !currentDailyPuzzle) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 className="w-10 h-10 animate-spin text-cc-green" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 h-full overflow-y-auto">
      <div className="flex justify-between w-full max-w-[1100px] mb-8">
        <Link href="/puzzles" className="text-zinc-400 hover:text-white transition-colors">
          ← Back to Puzzles
        </Link>
        <div className="text-xl font-bold font-serif text-white">
          Daily Puzzle
        </div>
      </div>

      {currentDailyPuzzle ? (
        <div className="w-full max-w-[1100px] flex flex-col gap-10">
          <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
            <span className="font-bold text-purple-400">Puzzle of the Day</span>
            <span className="text-zinc-400 text-sm">
              {new Date(currentDailyPuzzle.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <PuzzleSolver
            puzzle={currentDailyPuzzle.puzzle}
            onSolve={() => {}}
            onFail={() => {}}
          />

          <div className="bg-cc-bg-card border border-cc-border rounded-2xl p-6 shadow-xl mt-8">
            <h3 className="text-xl font-serif font-extrabold text-white mb-6">Community Discussion</h3>
            
            <form onSubmit={handleSubmitComment} className="flex gap-4 mb-8">
              <input 
                type="text" 
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your thoughts on today's puzzle..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!commentInput.trim()}
                className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Post
              </button>
            </form>

            <div className="flex flex-col gap-4">
              {dailyPuzzleComments.length > 0 ? (
                dailyPuzzleComments.map(comment => (
                  <div key={comment.id} className="flex gap-4 p-4 bg-cc-bg-page rounded-xl border border-cc-border-light">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center font-bold text-zinc-400 overflow-hidden border border-zinc-700">
                      {comment.user.image ? (
                         <img src={comment.user.image} alt="User avatar" className="w-full h-full object-cover" />
                      ) : (
                         comment.user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white text-sm">{comment.user.name}</span>
                        <span className="text-xs text-zinc-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-zinc-500 py-8 italic">
                  Be the first to comment on today's puzzle!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-zinc-400">Failed to load daily puzzle.</div>
      )}
    </div>
  );
}
