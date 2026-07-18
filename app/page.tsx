"use client";

import React from "react";
import Chessboard from "../components/Chessboard";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { QuestWidget } from "@/features/quests/components/QuestWidget";
import { FactionMap } from "@/features/factions/components/FactionMap";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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
  const container = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Respect prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) {
        // Just ensure opacity is set to 1 if we initialised anything hidden, but GSAP `from` handles this automatically if skipped.
        // Easiest is just returning if motion is reduced, allowing default render.
        return;
      }

      // Strategy 1: The Orchestrated Hero Reveal (Premium Advanced Tier)
      const tl = gsap.timeline();

      // 1. The Chessboard - 3D Perspective Reveal with Blur
      gsap.set(".hero-board", { transformPerspective: 1000 });
      tl.fromTo(".hero-board", 
        { 
          scale: 0.85, 
          opacity: 0, 
          rotationX: 15,
          rotationY: -10,
          y: 40,
          filter: "blur(12px)"
        },
        { 
          scale: 1, 
          opacity: 1, 
          rotationX: 0,
          rotationY: 0,
          y: 0,
          filter: "blur(0px)",
          duration: 1.6,
          ease: "expo.out"
        }
      )
      // 2. The Title & Greeting - Elegant Blur Fade Up
      const textTargets = [".hero-title"];
      if (document.querySelector(".hero-greeting")) textTargets.push(".hero-greeting");
      if (document.querySelector(".hero-quest")) textTargets.push(".hero-quest");

      tl.fromTo(
        textTargets.join(", "),
        { y: 30, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, stagger: 0.1, ease: "power3.out" },
        "-=1.3" // Deep overlap so the text arrives while the board is still settling
      )
      // 3. The Action Buttons - Elite 3D Fold-Down & Blur
      gsap.set(".hero-mode-btn", { transformPerspective: 800, transformOrigin: "50% 0%" });
      tl.fromTo(
        "div:has(> .hero-mode-btn) .hero-mode-btn", // Or just .hero-mode-btn but within container
        { 
          rotationX: -60, 
          y: 30, 
          opacity: 0, 
          filter: "blur(10px)" 
        },
        { 
          rotationX: 0, 
          y: 0, 
          opacity: 1, 
          filter: "blur(0px)",
          duration: 1.1, 
          stagger: 0.06, 
          ease: "back.out(1.5)" 
        },
        "-=1.0"
      )
      // 4. Micro-interactions: Pop the icons inside the buttons sequentially
      .fromTo(
        ".hero-mode-icon",
        { scale: 0.3, rotation: -45, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.8, stagger: 0.06, ease: "back.out(2.5)" },
        "-=0.8"
      );

      // Add a subtle, continuous ambient float to the board AFTER it enters
      tl.add(() => {
        gsap.to(".hero-board", {
          y: -12,
          rotationX: 2,
          rotationY: -1,
          duration: 4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      });

      // Strategy 2: Scroll-Triggered Contextual Reveal
      if (document.querySelector(".faction-map-container")) {
        gsap.fromTo(".faction-map-container", 
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".faction-map-container",
              start: "top 85%",
            },
          }
        );
      }
    },
    { scope: container, dependencies: [session] } // Re-run if session changes (as new elements might appear)
  );

  return (
    <div
      ref={container}
      className="flex-1 w-full flex flex-col font-sans bg-[var(--cc-bg-page)] text-[var(--cc-text-primary)]"
    >
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">

          <div className="lg:col-span-6 xl:col-span-7 flex justify-center items-center">
            <div className="hero-board w-full max-w-md aspect-square rounded-lg overflow-hidden shadow-2xl">
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
            <h1 className="hero-title text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Play Chess Online
            </h1>

            {session && (
              <p
                className="hero-greeting text-sm font-medium text-[var(--cc-text-secondary)]"
              >
                Welcome back, <span className="text-[var(--cc-green)]">{session.user.name}</span>
              </p>
            )}

            {session && (
              <div className="hero-quest w-full max-w-[380px] mt-2">
                <QuestWidget />
              </div>
            )}

            <div className="flex flex-col gap-2.5 w-full max-w-[380px] mt-2">
              {GAME_MODES.map((mode) => (
                <button
                  key={mode.href}
                  onClick={() => router.push(mode.href)}
                  className={`hero-mode-btn w-full flex items-center justify-start gap-4 px-5 py-3.5 rounded-xl transition-all cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0 border ${
                    mode.accent
                      ? "bg-[var(--cc-green)] border-[var(--cc-green)] text-white hover:bg-[var(--cc-green-hover)]"
                      : `bg-[var(--cc-bg-card)] border-[var(--cc-border)] text-[var(--cc-text-primary)] hover:bg-[var(--cc-bg-hover)] hover:border-[var(--cc-border-light)] ${mode.accentClass}`
                  }`}
                  id={`home-mode-${mode.href.split("/").pop()}`}
                >
                  <span className="hero-mode-icon text-2xl">{mode.icon}</span>
                  <div className="hero-mode-text flex flex-col items-start text-left">
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
          
          {session && (
            <div className="faction-map-container lg:col-span-12 w-full mt-4">
              <FactionMap />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
