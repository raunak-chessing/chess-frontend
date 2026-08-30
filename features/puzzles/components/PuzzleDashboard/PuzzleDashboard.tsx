"use client";

import { memo } from "react";
import { Target, Zap, Swords, Calendar, Search, Shield } from "lucide-react";
import { BlurText } from "@/components/react-bits";
import { OptionCardGrid, type OptionCardItem } from "@/components/features/OptionCardGrid";

const MODES: OptionCardItem[] = [
  {
    href: "/puzzles/rated",
    Icon: Target,
    title: "Rated Puzzles",
    description: "Endless puzzles tailored to your skill level. Watch your puzzle rating grow!",
    accent: "green",
  },
  {
    href: "/puzzles/rush",
    Icon: Zap,
    title: "Puzzle Rush",
    description: "Solve as many puzzles as you can in 3 minutes. 3 strikes and you're out!",
    accent: "amber",
  },
  {
    href: "/play/battle",
    Icon: Swords,
    title: "Puzzle Battle",
    description: "Race head-to-head against an opponent in real-time. First to strike out loses.",
    accent: "blue",
  },
  {
    href: "/puzzles/daily",
    Icon: Calendar,
    title: "Daily Puzzle",
    description: "One featured puzzle for the community every day. Discuss the solution below.",
    accent: "purple",
  },
  {
    href: "/puzzles/custom",
    Icon: Search,
    title: "Custom Puzzles",
    description: "Filter puzzles by specific motifs like Forks, Pins, Endgame, or Mate in 2.",
    accent: "pink",
  },
  {
    href: "/puzzles/survival",
    Icon: Shield,
    title: "Survival Mode",
    description: "Puzzle Rush without a time limit—keep going until you get 3 strikes.",
    accent: "red",
  },
];

export const PuzzleDashboard = memo(function PuzzleDashboard() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-250 mx-auto p-4">
      <div className="flex flex-col items-center text-center gap-2 mb-4">
        <BlurText
          text="Puzzles & Tactics"
          animateBy="words"
          direction="top"
          className="text-4xl font-serif font-extrabold text-cc-text-primary justify-center"
        />
        <p className="text-cc-text-secondary text-sm max-w-xl">
          Sharpen your tactical vision and improve your calculation with our endless puzzle database.
          Race against the clock, battle friends, or train by motif.
        </p>
      </div>

      <OptionCardGrid items={MODES} variant="tile" />
    </div>
  );
});
