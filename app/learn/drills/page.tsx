"use client";

import Link from "next/link";
import { DRILLS } from "../../../features/academy/constants/drills";
import { Card } from "../../../components/ui/Card";

export default function DrillsPage() {
  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 h-full overflow-y-auto">
      <div className="flex justify-between w-full max-w-[1000px] mb-8">
        <Link href="/learn" className="text-zinc-400 hover:text-white transition-colors">
          ← Back to Academy
        </Link>
        <div className="text-xl font-bold font-serif text-white">
          Drills & Endgame Practice
        </div>
      </div>

      <div className="w-full max-w-[1000px]">
        <Card className="p-8 rounded-3xl mb-8 border-none bg-gradient-to-br from-indigo-900/40 to-slate-900 shadow-2xl">
          <h1 className="text-3xl font-black text-white mb-2">Master the Essentials</h1>
          <p className="text-zinc-400 max-w-xl">
            Practice essential endgames and tactical scenarios against the Stockfish engine. 
            Keep playing these positions until you can win them perfectly every time.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DRILLS.map((drill) => (
            <Link href={`/learn/drills/${drill.id}`} key={drill.id}>
              <div className="bg-cc-bg-card p-6 rounded-2xl border border-cc-border hover:border-indigo-500/50 hover:bg-cc-bg-hover transition-all cursor-pointer shadow-lg hover:-translate-y-1 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] px-2 py-1 bg-zinc-800 rounded text-zinc-300 font-bold uppercase tracking-wider font-mono">
                    {drill.category}
                  </span>
                  <span className="text-xl">{drill.playerColor === 'w' ? '⚪' : '⚫'}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">{drill.title}</h3>
                <p className="text-xs text-zinc-400 flex-grow">{drill.description}</p>
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <span>Start Drill</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
