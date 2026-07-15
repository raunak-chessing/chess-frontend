"use client";

import { memo, useMemo, useEffect, useRef } from "react";
import { Chess } from "chess.js";

interface MoveHistoryProps {
  game: Chess;
  viewMoveIndex: number | null;
  onSelectMoveIndex: (index: number | null) => void;
  boardHeightClass?: string;
}

const MoveHistory = memo(function MoveHistory({
  game,
  viewMoveIndex,
  onSelectMoveIndex,
  boardHeightClass = "lg:h-[85vh]",
}: MoveHistoryProps) {
  const history = useMemo(() => game.history({ verbose: true }), [game, game.history().length]);
  const containerRef = useRef<HTMLDivElement>(null);

  const movePairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        round: Math.floor(i / 2) + 1,
        white: history[i],
        black: history[i + 1] || null,
        whiteIndex: i,
        blackIndex: i + 1,
      });
    }
    return pairs;
  }, [history]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [movePairs.length]);

  return (
    <div className={`flex flex-col border rounded-2xl w-full lg:w-64 ${boardHeightClass} p-4 bg-cc-bg-card border-cc-border`}>
      <div className="flex justify-between items-center border-b pb-2 mb-3 border-cc-border">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cc-text-primary">
          Move History
        </h3>
        {viewMoveIndex !== null && (
          <button
            onClick={() => onSelectMoveIndex(null)}
            className="px-2 py-0.5 text-[10px] bg-emerald-800 hover:bg-emerald-700 text-white rounded cursor-pointer transition-colors font-semibold"
          >
            Live Game
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cc-border scrollbar-track-transparent text-cc-text-secondary"
      >
        {movePairs.length === 0 ? (
          <div className="text-slate-500 italic text-center py-8 text-[11px]">
            No moves played yet.
          </div>
        ) : (
          movePairs.map((pair) => (
            <div
              key={pair.round}
              className="grid grid-cols-12 gap-1 py-1 px-1.5 rounded hover:bg-slate-950/20"
            >
              <span className="col-span-2 text-slate-500 font-serif font-bold text-center">
                {pair.round}.
              </span>
              
              <button
                onClick={() => onSelectMoveIndex(pair.whiteIndex)}
                className={`col-span-5 text-left px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  viewMoveIndex === pair.whiteIndex
                    ? "bg-cc-text-primary text-cc-bg-page font-bold"
                    : "hover:bg-slate-800/50"
                }`}
              >
                {pair.white.san}
              </button>

              {pair.black ? (
                <button
                  onClick={() => onSelectMoveIndex(pair.blackIndex)}
                  className={`col-span-5 text-left px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    viewMoveIndex === pair.blackIndex
                      ? "bg-cc-text-primary text-cc-bg-page font-bold"
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  {pair.black.san}
                </button>
              ) : (
                <span className="col-span-5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

export default MoveHistory;
