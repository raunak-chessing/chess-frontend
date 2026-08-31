"use client";

import { Lightning, Cpu, Users, PuzzlePiece, Sword, Skull, Radio } from "@phosphor-icons/react";
import { OptionCardGrid, type OptionCardItem } from "@/components/features/OptionCardGrid";

const MODES: OptionCardItem[] = [
  {
    href: "/play/online",
    Icon: Lightning,
    title: "Play Online",
    description: "Play vs someone at your level",
    primary: true,
  },
  {
    href: "/play/computer",
    Icon: Cpu,
    title: "Play with Computer",
    description: "Play vs customizable training bots",
    accent: "blue",
  },
  {
    href: "/play/local",
    Icon: Users,
    title: "Play with a Friend",
    description: "Play local PvP matches on one board",
    accent: "green",
  },
  {
    href: "/play/puzzles",
    Icon: PuzzlePiece,
    title: "Puzzle Rush",
    description: "Solve puzzles under a 3-minute timer",
    accent: "purple",
  },
  {
    href: "/play/battle",
    Icon: Sword,
    title: "Puzzle Battle",
    description: "Race an opponent — same puzzle, first to solve wins",
    accent: "amber",
    badge: "NEW",
  },
  {
    href: "/play/boss",
    Icon: Skull,
    title: "Boss Fight",
    description: "Team up with your faction to take down a world boss",
    accent: "red",
  },
  {
    href: "/play/streamer",
    Icon: Radio,
    title: "Streamer Mode",
    description: "Spectator-voted chess — the crowd picks the move",
    accent: "pink",
  },
];

export default function PlayOptions() {
  return <OptionCardGrid items={MODES} variant="row" className="w-full max-w-105 mt-4" />;
}
