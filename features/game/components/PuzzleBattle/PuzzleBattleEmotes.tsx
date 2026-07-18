"use client";

import { memo, useState } from "react";
import type { Emote } from "../../hooks/usePuzzleBattle";

const AVAILABLE_EMOTES = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "👑", label: "Crown" },
  { emoji: "🤯", label: "Mind blown" },
  { emoji: "😤", label: "Determined" },
  { emoji: "⚡", label: "Lightning" },
  { emoji: "🧠", label: "Big brain" },
  { emoji: "💪", label: "Strong" },
  { emoji: "😈", label: "Evil" },
];

interface PuzzleBattleEmotesProps {
  emotes: Emote[];
  onSendEmote: (emoji: string) => void;
}

function FloatingEmote({ emote }: { emote: Emote }) {
  const [offsetX] = useState(() => Math.random() * 60 - 30);
  const [duration] = useState(() => 2.5 + Math.random() * 1);

  return (
    <div
      className="pointer-events-none fixed z-50 select-none animate-[battle-float-up_3s_ease-out_forwards]"
      style={{
        bottom: "5rem",
        left: emote.fromOpponent ? `calc(75% + ${offsetX}px)` : `calc(25% + ${offsetX}px)`,
        fontSize: "2.5rem",
        animationDuration: `${duration}s`,
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
      }}
    >
      {emote.emoji}
    </div>
  );
}

export const PuzzleBattleEmotes = memo(function PuzzleBattleEmotes({
  emotes,
  onSendEmote,
}: PuzzleBattleEmotesProps) {
  return (
    <>
      {emotes.map((emote) => (
        <FloatingEmote key={emote.id} emote={emote} />
      ))}

      <div className="flex flex-col gap-2">
        <span className="text-[9px] uppercase tracking-widest text-cc-text-muted font-bold font-serif text-center">
          Emotes
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {AVAILABLE_EMOTES.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => onSendEmote(emoji)}
              title={label}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-cc-bg-sidebar border border-cc-border hover:border-cc-border-light hover:bg-cc-bg-hover hover:scale-110 active:scale-95 transition-all duration-150 text-lg cursor-pointer"
              id={`battle-emote-${label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
});
