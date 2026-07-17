"use client";

import React from "react";
import Chessboard from "../components/Chessboard";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { QuestWidget } from "@/features/quests/components/QuestWidget";

const GAME_MODES = [
  {
    href: "/play/online",
    icon: "⚡",
    title: "Play Online",
    description: "Play vs someone at your level",
    accent: true,
    accentClass: "",
  },
  {
    href: "/play/computer",
    icon: "💻",
    title: "Play Computer",
    description: "Play vs customizable training bots",
    accent: false,
    accentClass: "",
  },
  {
    href: "/play/local",
    icon: "👥",
    title: "Play a Friend",
    description: "Play local PvP on one board",
    accent: false,
    accentClass: "",
  },
  {
    href: "/play/puzzles",
    icon: "🧩",
    title: "Puzzle Rush",
    description: "Solve puzzles under a 3-minute timer",
    accent: false,
    accentClass: "",
  },
  {
    href: "/play/battle",
    icon: "⚔️",
    title: "Puzzle Battle",
    description: "Race an opponent — same puzzle, first to solve wins",
    accent: false,
    accentClass: "border-[var(--cc-accent-gold)]/40 hover:border-[var(--cc-accent-gold)] hover:bg-[var(--cc-accent-gold)]/5",
  },
  {
    href: "/learn",
    icon: "📖",
    title: "Chess Academy",
    description: "Learn tactics, openings, and strategies",
    accent: false,
    accentClass: "",
  },
] as const;


export default function Home() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  return (
    <div
      className="flex-1 w-full flex flex-col font-sans bg-[var(--cc-bg-page)] text-[var(--cc-text-primary)]"
    >
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">

          <div className="lg:col-span-6 xl:col-span-7 flex justify-center items-center">
            <div className="w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Chessboard
                position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                flipped={false}
                onPieceDrop={() => false}
                squareStyles={{}}
                onSquareClick={() => {}}
              />
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left gap-5">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Play Chess Online
            </h1>

            {session && (
              <p
                className="text-sm font-medium text-[var(--cc-text-secondary)]"
              >
                Welcome back, <span className="text-[var(--cc-green)]">{session.user.name}</span>
              </p>
            )}

            {session && (
              <div className="w-full max-w-[380px] mt-2">
                <QuestWidget />
              </div>
            )}

            <div className="flex flex-col gap-2.5 w-full max-w-[380px] mt-2">
              {GAME_MODES.map((mode) => (
                <button
                  key={mode.href}
                  onClick={() => router.push(mode.href)}
                  className={`w-full flex items-center justify-start gap-4 px-5 py-3.5 rounded-xl transition-all cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0 border ${
                    mode.accent
                      ? "bg-[var(--cc-green)] border-[var(--cc-green)] text-white hover:bg-[var(--cc-green-hover)]"
                      : `bg-[var(--cc-bg-card)] border-[var(--cc-border)] text-[var(--cc-text-primary)] hover:bg-[var(--cc-bg-hover)] hover:border-[var(--cc-border-light)] ${mode.accentClass}`
                  }`}
                  id={`home-mode-${mode.href.split("/").pop()}`}
                >
                  <span className="text-2xl">{mode.icon}</span>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-base font-bold leading-tight">{mode.title}</span>
                    <span
                      className={`text-xs font-medium ${
                        mode.accent ? "text-white/85" : "text-[var(--cc-text-muted)]"
                      }`}
                    >
                      {mode.description}
                    </span>
                  </div>
                  {mode.href === "/play/battle" && (
                    <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-[var(--cc-accent-gold)] bg-[var(--cc-accent-gold)]/10 border border-[var(--cc-accent-gold)]/30 px-1.5 py-0.5 rounded-full shrink-0">
                      NEW
                    </span>
                  )}
                </button>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
