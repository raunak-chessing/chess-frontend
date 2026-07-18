import React from "react";
import { Card } from "../../../../components/ui/Card";
import { SelectableCard } from "../../../../components/ui/SelectableCard";
import { SectionHeader } from "../../../../components/ui/SectionHeader";
import { OnlineMatchmaker } from "../OnlineMatchmaker";
import { TIME_CONTROLS, CHESS_VARIANTS, COMPUTER_OPPONENTS } from "../../constants/setupOptions";
import type { GameMode, GameVariant } from "../../types/game.types";

interface GameSetupLobbyProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  onReturnHome: () => void;
  selectedVariant: GameVariant;
  setSelectedVariant: (variant: GameVariant) => void;
  localTimeControl: string;
  setLocalTimeControl: (tc: string) => void;
  botDifficulty: number;
  setBotDifficulty: (difficulty: number) => void;
  botSide: "w" | "b" | "random";
  setBotSide: (side: "w" | "b" | "random") => void;
  isBlindfold: boolean;
  setIsBlindfold: (isBlindfold: boolean) => void;
  socketState: any; // Ideally we type this correctly, but using any for quick refactor
  onStartGame: (flip: boolean) => void;
}

export function GameSetupLobby({
  gameMode,
  setGameMode,
  onReturnHome,
  selectedVariant,
  setSelectedVariant,
  localTimeControl,
  setLocalTimeControl,
  botDifficulty,
  setBotDifficulty,
  botSide,
  setBotSide,
  isBlindfold,
  setIsBlindfold,
  socketState,
  onStartGame,
}: GameSetupLobbyProps) {
  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden bg-cc-bg-sidebar text-cc-text-primary">
      <div className="grid-background"></div>
      <Card className="w-full max-w-xl flex flex-col gap-6 relative z-10">
        <div className="flex justify-between items-center border-b pb-4 border-cc-border-light">
          <h2 className="text-2xl font-bold font-sans tracking-tight text-cc-text-primary">
            {gameMode === "online"
              ? "Play Online"
              : gameMode === "pvp"
              ? "Play Locally"
              : "Play vs Computer"}
          </h2>
          <button
            onClick={onReturnHome}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-colors bg-cc-bg-input text-cc-text-secondary hover:bg-cc-bg-hover"
          >
            Quit Setup
          </button>
        </div>

        {gameMode !== "online" && (
          <div className="flex flex-col gap-2">
            <SectionHeader>Select Chess Variant</SectionHeader>
            <div className="grid grid-cols-2 gap-3">
              {CHESS_VARIANTS.map((v) => {
                const isActive = selectedVariant === v.id;
                return (
                  <SelectableCard
                    key={v.id}
                    isActive={isActive}
                    onClick={() => setSelectedVariant(v.id as GameVariant)}
                    className="p-3 rounded-xl flex flex-col items-start gap-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{v.icon}</span>
                      <span className="text-sm font-bold font-sans">{v.name}</span>
                    </div>
                    <span className="text-[11px] font-medium leading-tight opacity-80">{v.desc}</span>
                  </SelectableCard>
                );
              })}
            </div>
          </div>
        )}

        {gameMode !== "online" && (
          <div className="flex flex-col gap-2 border-t pt-4 border-cc-border-light">
            <SectionHeader>Select Time Control</SectionHeader>
            <div className="grid grid-cols-4 gap-2">
              {TIME_CONTROLS.map((tc) => {
                const isActive = localTimeControl === tc.value;
                return (
                  <SelectableCard
                    key={tc.value}
                    isActive={isActive}
                    onClick={() => setLocalTimeControl(tc.value)}
                    className="py-2 px-1 text-[10px] font-bold rounded-xl flex flex-col items-center justify-center gap-0.5"
                  >
                    <span>{tc.name}</span>
                    <span className="text-[8px] opacity-70 font-semibold">{tc.type}</span>
                  </SelectableCard>
                );
              })}
            </div>
          </div>
        )}

        {(gameMode === "computer-black" || gameMode === "computer-white") && (
          <>
            <div className="flex flex-col gap-2 border-t pt-4 border-cc-border-light">
              <SectionHeader>Choose Computer Opponent</SectionHeader>
              <div className="grid grid-cols-4 gap-3">
                {COMPUTER_OPPONENTS.map((b) => {
                  const isActive = botDifficulty === b.id;
                  return (
                    <SelectableCard
                      key={b.id}
                      isActive={isActive}
                      onClick={() => setBotDifficulty(b.id)}
                      className="p-3 rounded-xl flex flex-col items-center gap-1 text-center relative"
                    >
                      <span className="text-3xl mb-1">{b.icon}</span>
                      <span className="text-sm font-bold font-sans leading-none">{b.name}</span>
                      <span className="text-[10px] font-semibold opacity-70">Elo {b.elo}</span>
                    </SelectableCard>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t pt-4 border-cc-border-light">
              <SectionHeader>Choose Side</SectionHeader>
              <div className="grid grid-cols-3 gap-2">
                <SelectableCard
                  isActive={botSide === "w"}
                  onClick={() => setBotSide("w")}
                  className="py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-bold"
                >
                  <span className="text-lg">⚪</span> Play White
                </SelectableCard>
                <SelectableCard
                  isActive={botSide === "random"}
                  onClick={() => setBotSide("random")}
                  className="py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-bold"
                >
                  <span className="text-lg">🎲</span> Random
                </SelectableCard>
                <SelectableCard
                  isActive={botSide === "b"}
                  onClick={() => setBotSide("b")}
                  className="py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-bold"
                >
                  <span className="text-lg">⚫</span> Play Black
                </SelectableCard>
              </div>
            </div>
          </>
        )}

        {gameMode !== "online" && (
          <div className="flex flex-col gap-2 border-t pt-4 border-cc-border-light">
            <SectionHeader>Training Modes</SectionHeader>
            <div className="flex items-center gap-2">
              <SelectableCard
                isActive={isBlindfold}
                onClick={() => setIsBlindfold(!isBlindfold)}
                className="py-2 px-4 rounded-xl text-xs font-bold"
              >
                Blindfold Mode
              </SelectableCard>
            </div>
          </div>
        )}

        {gameMode === "online" ? (
          <div className="mt-4">
            <OnlineMatchmaker
              joinedRoom={socketState.joinedRoom}
              playerColor={socketState.playerColor}
              inQueue={socketState.inQueue}
              userRating={socketState.userRating}
              roomCode={socketState.roomCode}
              timeControl={socketState.timeControl}
              onTimeControlChange={socketState.setTimeControl}
              onRoomCodeChange={socketState.setRoomCode}
              onJoinQueue={socketState.handleJoinQueue}
              onLeaveQueue={socketState.handleLeaveQueue}
              onJoinRoom={socketState.handleJoinOnlineRoom}
            />
          </div>
        ) : (
          <button
            onClick={() => {
              let flip = false;
              if (gameMode === "computer-black" || gameMode === "computer-white") {
                let side = botSide;
                if (side === "random") {
                  side = Math.random() < 0.5 ? "w" : "b";
                }
                const finalMode = side === "w" ? "computer-black" : "computer-white";
                setGameMode(finalMode);
                flip = finalMode === "computer-white";
              }
              onStartGame(flip);
            }}
            className="w-full mt-4 py-4 rounded-xl text-white font-black text-xl tracking-wide cursor-pointer transition-all active:translate-y-[4px] bg-cc-green hover:bg-cc-green-hover shadow-[0_4px_0_var(--cc-green-dark)] active:shadow-none border border-transparent"
          >
            Play
          </button>
        )}
      </Card>
    </main>
  );
}
