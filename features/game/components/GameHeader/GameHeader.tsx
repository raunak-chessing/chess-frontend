import React from "react";
import type { GameMode } from "../../types/game.types";
import { GameStatusBar } from "../GameStatusBar";

interface GameHeaderProps {
  gameMode: GameMode;
  socketState: any;
  gameState: any;
  selfChecks: number;
  oppChecks: number;
  activeBot?: any;
  playerLeftTimeStr: string;
  playerRightTimeStr: string;
  serverClock: any;
  openingName: string;
}

export function GameHeader({
  gameMode,
  socketState,
  gameState,
  selfChecks,
  oppChecks,
  activeBot,
  playerLeftTimeStr,
  playerRightTimeStr,
  serverClock,
  openingName,
}: GameHeaderProps) {
  return (
    <>
      <div className="w-full flex items-center justify-between gap-4 mb-6 header-container-responsive">
        <div className="flex flex-col gap-1.5 items-start">
          <div className="px-3 py-1.5 rounded-xl flex items-center gap-3 w-40 md:w-52 h-14 justify-between border bg-cc-bg-card border-cc-border">
            <span className="font-bold text-sm md:text-base tracking-wide truncate max-w-[160px] md:max-w-[200px] text-cc-text-primary">
              {socketState.selfPlayer
                ? `${socketState.selfPlayer.name} (${socketState.selfPlayer.rating})`
                : "You"}
            </span>
          </div>
          {gameState.variant === "three-check" && (
            <div className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider ml-1">
              Checks: {selfChecks} / 3
            </div>
          )}
          <div
            className={`w-28 md:w-36 h-11 md:h-12 rounded-xl flex items-center justify-center font-mono text-2xl md:text-3xl font-extrabold tracking-widest border border-cc-border text-cc-text-primary ${
              gameMode === "online" &&
              (socketState.playerColor === "b"
                ? serverClock.isBlackLow
                : serverClock.isWhiteLow)
                ? "bg-red-500/20 text-red-400"
                : "bg-cc-bg-input"
            }`}
          >
            {playerLeftTimeStr}
          </div>
        </div>

        <GameStatusBar
          turn={gameState.turn}
          isCheckmate={gameState.game.isCheckmate()}
          isDraw={gameState.game.isDraw()}
          inCheck={gameState.game.inCheck()}
          gameMode={gameMode}
          joinedRoom={socketState.joinedRoom}
          inQueue={socketState.inQueue}
          userRating={socketState.userRating}
        />

        <div className="flex flex-col gap-1.5 items-end relative">
          <div className="rounded-xl flex items-center justify-between w-40 md:w-52 h-14 overflow-hidden border bg-cc-bg-card border-cc-border relative z-10">
            <div className="h-full w-11 md:w-14 flex items-center justify-center text-2xl bg-cc-bg-hover">
              {gameMode.includes("computer") && activeBot ? activeBot.icon : "🤖"}
            </div>
            <span className="flex-1 font-bold text-sm md:text-base tracking-wide text-center truncate px-2 max-w-[130px] md:max-w-[170px] text-cc-text-primary">
              {socketState.opponent
                ? `${socketState.opponent.name} (${socketState.opponent.rating})`
                : gameMode === "online"
                ? "Opponent"
                : gameMode === "pvp"
                ? "Black"
                : activeBot
                ? `${activeBot.name} (${activeBot.elo})`
                : "AI"}
            </span>
          </div>
          {gameMode.includes("computer") && activeBot && (
            <div className="absolute -bottom-8 right-0 text-[10px] bg-cc-bg-sidebar border border-cc-border text-cc-text-secondary px-3 py-1.5 rounded-2xl rounded-tr-sm shadow-md whitespace-nowrap z-20 transition-all">
              {activeBot.message}
            </div>
          )}
          {gameState.variant === "three-check" && (
            <div className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider mr-1">
              Checks: {oppChecks} / 3
            </div>
          )}
          <div
            className={`w-28 md:w-36 h-11 md:h-12 rounded-xl flex items-center justify-center font-mono text-2xl md:text-3xl font-extrabold tracking-widest border border-cc-border text-cc-text-primary ${
              gameMode === "online" &&
              (socketState.playerColor === "b"
                ? serverClock.isWhiteLow
                : serverClock.isBlackLow)
                ? "bg-red-500/20 text-red-400"
                : "bg-cc-bg-input"
            }`}
          >
            {playerRightTimeStr}
          </div>
        </div>
      </div>

      {openingName && (
        <div className="mb-4 text-xs font-serif font-bold text-cc-text-secondary tracking-widest uppercase bg-cc-bg-surface px-4 py-1.5 rounded-full border border-cc-border-light">
          {openingName}
        </div>
      )}

      {gameMode === "online" && !socketState.connected && (
        <div className="mb-4 bg-red-900/30 text-red-400 font-semibold px-6 py-2 rounded-xl text-sm border border-red-900/50 flex items-center gap-2 max-w-lg mx-auto w-full justify-center">
          ⚠️ Disconnected from chess server. Attempting to reconnect...
        </div>
      )}
    </>
  );
}
