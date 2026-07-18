"use client";

import { memo } from "react";
import Link from "next/link";

export const PuzzleDashboard = memo(function PuzzleDashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1000px] mx-auto p-4">
      <div className="flex flex-col items-center text-center gap-2 mb-4">
        <h1 className="text-4xl font-serif font-extrabold text-cc-text-primary">Puzzles & Tactics</h1>
        <p className="text-zinc-400 text-sm max-w-xl">
          Sharpen your tactical vision and improve your calculation with our endless puzzle database. 
          Race against the clock, battle friends, or train by motif.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {/* Rated Puzzles */}
        <Link
          href="/puzzles/rated"
          className="flex flex-col items-start gap-4 p-6 bg-cc-bg-card border border-cc-border hover:border-cc-green rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg text-left no-underline"
        >
          <div className="w-12 h-12 bg-cc-green/20 rounded-xl flex items-center justify-center text-2xl">
            🎯
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-white font-serif">Rated Puzzles</span>
            <span className="text-xs text-zinc-400 leading-relaxed">Endless puzzles tailored to your skill level. Watch your puzzle rating grow!</span>
          </div>
        </Link>

        {/* Puzzle Rush */}
        <Link
          href="/puzzles/rush"
          className="flex flex-col items-start gap-4 p-6 bg-cc-bg-card border border-cc-border hover:border-amber-500 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg text-left no-underline"
        >
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">
            ⚡
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-white font-serif">Puzzle Rush</span>
            <span className="text-xs text-zinc-400 leading-relaxed">Solve as many puzzles as you can in 3 minutes. 3 strikes and you're out!</span>
          </div>
        </Link>

        {/* Puzzle Battle */}
        <Link
          href="/play/battle"
          className="flex flex-col items-start gap-4 p-6 bg-cc-bg-card border border-cc-border hover:border-blue-500 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg text-left no-underline"
        >
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
            ⚔️
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-white font-serif">Puzzle Battle</span>
            <span className="text-xs text-zinc-400 leading-relaxed">Race head-to-head against an opponent in real-time. First to strike out loses.</span>
          </div>
        </Link>

        {/* Daily Puzzle */}
        <Link
          href="/puzzles/daily"
          className="flex flex-col items-start gap-4 p-6 bg-cc-bg-card border border-cc-border hover:border-purple-500 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg text-left no-underline"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
            📅
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-white font-serif">Daily Puzzle</span>
            <span className="text-xs text-zinc-400 leading-relaxed">One featured puzzle for the community every day. Discuss the solution below.</span>
          </div>
        </Link>

        {/* Custom Puzzles */}
        <Link
          href="/puzzles/custom"
          className="flex flex-col items-start gap-4 p-6 bg-cc-bg-card border border-cc-border hover:border-pink-500 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg text-left no-underline"
        >
          <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-2xl">
            🔍
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-white font-serif">Custom Puzzles</span>
            <span className="text-xs text-zinc-400 leading-relaxed">Filter puzzles by specific motifs like Forks, Pins, Endgame, or Mate in 2.</span>
          </div>
        </Link>

        {/* Survival Mode */}
        <Link
          href="/puzzles/survival"
          className="flex flex-col items-start gap-4 p-6 bg-cc-bg-card border border-cc-border hover:border-red-500 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg text-left no-underline"
        >
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-white font-serif">Survival Mode</span>
            <span className="text-xs text-zinc-400 leading-relaxed">Puzzle Rush without a time limit—keep going until you get 3 strikes.</span>
          </div>
        </Link>
      </div>
    </div>
  );
});
