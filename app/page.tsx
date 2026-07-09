"use client";

import React, { useState } from "react";
import Chessboard from "../components/Chessboard";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { GameView, GameMode } from "@/features/game";

type ViewState = "home" | "play";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [viewState, setViewState] = useState<ViewState>("home");
  const [gameMode, setGameMode] = useState<GameMode>("pvp");

  const startOption = (mode: GameMode) => {
    setGameMode(mode);
    setViewState("play");
  };

  if (viewState === "play") {
    return (
      <GameView
        initialMode={gameMode}
        onReturnHome={() => setViewState("home")}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#302e2b] flex flex-col text-zinc-100 font-sans">
      <header className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between border-b border-zinc-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#81b64c] rounded-lg flex items-center justify-center shadow-md shadow-green-950/20">
            <span className="text-lg text-white font-bold">♔</span>
          </div>
          <span className="font-bold tracking-tight text-white text-lg">Chess Arena</span>
        </div>

        <div>
          {isPending ? (
            <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-white">{session.user.name}</span>
                <span className="text-[10px] text-[#81b64c] font-bold">Elo: 1200</span>
              </div>
              <button
                onClick={async () => {
    await authClient.signOut();
    router.refresh();
  }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/50 hover:border-zinc-600 rounded-lg text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
                id="home-logout"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-transparent hover:bg-zinc-800/40 border border-transparent rounded-lg text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
                id="home-login"
              >
                Log In
              </button>
              <button
                onClick={() => router.push("/signup")}
                className="px-4 py-2 bg-[#81b64c] hover:bg-[#6fa33f] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md shadow-green-950/10"
                id="home-signup"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          <div className="lg:col-span-6 xl:col-span-7 flex justify-center items-center">
            <div className="w-full max-w-[500px] aspect-square rounded-lg overflow-hidden shadow-2xl">
              <Chessboard
                position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                flipped={false}
                onPieceDrop={() => false}
                squareStyles={{}}
                onSquareClick={() => {}}
              />
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Play Chess <br className="hidden lg:inline" />
              Online on the <br className="hidden lg:inline" />
              #1 Site!
            </h1>

            <div className="flex items-center gap-6 text-xs text-zinc-400 font-semibold mt-1">
              <div className="flex flex-col">
                <span className="text-white text-lg font-bold">14,204,912</span>
                <span>Games Today</span>
              </div>
              <div className="w-px h-8 bg-zinc-700" />
              <div className="flex flex-col">
                <span className="text-white text-lg font-bold">158,401</span>
                <span>Playing Now</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[380px] mt-4">
              
              <button
                onClick={() => startOption("online")}
                className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl bg-[#81b64c] hover:bg-[#a3d16c] transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-white"
              >
                <span className="text-3xl">⚡</span>
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg font-bold leading-tight">Play Online</span>
                  <span className="text-xs opacity-90 font-medium">Play vs someone at your level</span>
                </div>
              </button>

              <button
                onClick={() => startOption("computer-black")}
                className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl bg-[#262421] hover:bg-[#32302d] border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-zinc-200"
              >
                <span className="text-3xl">💻</span>
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg font-bold leading-tight">Play with Computer</span>
                  <span className="text-xs text-zinc-400 font-medium">Play vs customizable training bots</span>
                </div>
              </button>

              <button
                onClick={() => startOption("pvp")}
                className="w-full flex items-center justify-start gap-4 px-6 py-4 rounded-xl bg-[#262421] hover:bg-[#32302d] border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-zinc-200"
              >
                <span className="text-3xl">👥</span>
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg font-bold leading-tight">Play with a Friend</span>
                  <span className="text-xs text-zinc-400 font-medium">Play local PvP matches on one board</span>
                </div>
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
