"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { GameMode } from "../../types/game.types";
import { useGameState } from "../../hooks/useGameState";
import { useGameSocket } from "../../hooks/useGameSocket";
import { useChessEngine } from "../../hooks/useChessEngine";
import { Board } from "../Board";
import { CapturedPieces } from "../CapturedPieces";
import { GameStatusBar } from "../GameStatusBar";
import { GameControls } from "../GameControls";

interface GameViewProps {
  initialMode: GameMode;
  onReturnHome: () => void;
}

export default function GameView({ initialMode, onReturnHome }: GameViewProps) {
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);

  const [localResult, setLocalResult] = useState<"won" | "lost" | "draw" | "opponent-disconnected" | "opponent-resigned" | null>(null);
  const [overlayDismissed, setOverlayDismissed] = useState(false);

  const gameState = useGameState();

  const socketHandlers = useMemo(
    () => ({
      applyMove: gameState.applyMove,
      applyUndo: gameState.applyUndo,
      resetGame: () => {
        setLocalResult(null);
        setOverlayDismissed(false);
        gameState.resetGame();
      },
      onOpponentDisconnected: () => {
        if (gameState.game.history().length > 0 && !gameState.game.isGameOver()) {
          setLocalResult("opponent-disconnected");
          setOverlayDismissed(false);
        }
      },
      onOpponentResigned: () => {
        setLocalResult("opponent-resigned");
        setOverlayDismissed(false);
      },
    }),
    [gameState],
  );

  const socketState = useGameSocket(socketHandlers);

  useEffect(() => {
    const { joinedRoom, inQueue, handleJoinQueue } = socketState;
    if (gameMode === "online" && !joinedRoom && !inQueue) {
      handleJoinQueue();
    }
  }, [gameMode, socketState]);

  let derivedResult: "won" | "lost" | "draw" | "opponent-disconnected" | "opponent-resigned" | null = localResult;

  if (!derivedResult && gameState.game.isGameOver()) {
    if (gameState.game.isCheckmate()) {
      const turn = gameState.game.turn();
      if (gameMode === "online") {
        derivedResult = socketState.playerColor === turn ? "lost" : "won";
      } else if (gameMode === "computer-black") {
        derivedResult = turn === "b" ? "won" : "lost";
      } else if (gameMode === "computer-white") {
        derivedResult = turn === "w" ? "won" : "lost";
      } else {
        derivedResult = turn === "w" ? "lost" : "won";
      }
    } else if (gameState.game.isDraw()) {
      derivedResult = "draw";
    }
  }

  const showOverlay = derivedResult !== null && !overlayDismissed;

  useEffect(() => {
    if (derivedResult && (derivedResult === "won" || derivedResult === "lost" || derivedResult === "draw")) {
      const timer = setTimeout(() => {
        setOverlayDismissed(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [derivedResult]);

  useChessEngine({
    game: gameState.game,
    fen: gameState.fen,
    gameMode,
    autoFlip: gameState.autoFlip,
    applyMove: gameState.applyMove,
  });

  const handleGameModeChange = useCallback(
    (mode: GameMode) => {
      setLocalResult(null);
      setOverlayDismissed(false);
      setGameMode(mode);
      gameState.resetGame(mode === "computer-white");
    },
    [gameState],
  );

  const handlePieceDrop = useCallback(
    (source: string, target: string): boolean => {
      return gameState.handlePieceDrop(
        source,
        target,
        gameMode,
        socketState.joinedRoom,
        socketState.playerColor,
        socketState.socket,
      );
    },
    [
      gameState,
      gameMode,
      socketState.joinedRoom,
      socketState.playerColor,
      socketState.socket,
    ],
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      gameState.handleSquareClick(
        square,
        gameMode,
        socketState.joinedRoom,
        socketState.playerColor,
        socketState.socket,
      );
    },
    [
      gameState,
      gameMode,
      socketState.joinedRoom,
      socketState.playerColor,
      socketState.socket,
    ],
  );

  const handleUndo = useCallback(() => {
    gameState.handleUndo(gameMode, socketState.joinedRoom, socketState.socket);
  }, [gameState, gameMode, socketState.joinedRoom, socketState.socket]);

  const handleReset = useCallback(() => {
    setLocalResult(null);
    setOverlayDismissed(false);
    gameState.handleReset(gameMode, socketState.joinedRoom, socketState.socket);
  }, [gameState, gameMode, socketState.joinedRoom, socketState.socket]);

  const handleFlipBoard = useCallback(() => {
    gameState.setFlipped((prev) => !prev);
  }, [gameState]);

  const handleResign = useCallback(() => {
    if (gameMode === "online" && socketState.joinedRoom) {
      socketState.socket.emit("resign", { room: socketState.joinedRoom });
    }
    setLocalResult("lost");
    setOverlayDismissed(false);
  }, [gameMode, socketState.joinedRoom, socketState.socket]);

  const getOverlayConfig = () => {
    if (!showOverlay) return null;
    switch (derivedResult) {
      case "won":
        return {
          title: "🎉 Victory!",
          description: "You won the match!",
          bgClass: "bg-emerald-950/90 border-emerald-500/30 text-emerald-200",
          buttonClass: "bg-emerald-600 hover:bg-emerald-500",
        };
      case "lost":
        return {
          title: "🏳️ Defeat",
          description: "You lost this match.",
          bgClass: "bg-red-950/90 border-red-500/30 text-red-200",
          buttonClass: "bg-red-750 hover:bg-red-650",
        };
      case "draw":
        return {
          title: "🤝 Draw",
          description: "The game ended in a draw.",
          bgClass: "bg-zinc-900/95 border-zinc-700/50 text-zinc-200",
          buttonClass: "bg-zinc-700 hover:bg-zinc-600",
        };
      case "opponent-disconnected":
        return {
          title: "🔌 Opponent Disconnected",
          description: "Your opponent left the game.",
          bgClass: "bg-amber-950/90 border-amber-500/30 text-amber-200",
          buttonClass: "bg-amber-700 hover:bg-amber-600",
        };
      case "opponent-resigned":
        return {
          title: "🎉 Victory by Resignation!",
          description: "Your opponent resigned.",
          bgClass: "bg-emerald-950/90 border-emerald-500/30 text-emerald-200",
          buttonClass: "bg-emerald-600 hover:bg-emerald-500",
        };
      default:
        return null;
    }
  };

  const overlayConfig = getOverlayConfig();

  return (
    <main className="min-h-screen w-full bg-[#302e2b] flex items-center justify-center p-4 md:p-8 text-zinc-100 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 md:p-6 rounded-2xl shadow-2xl">
          {gameMode === "online" && !socketState.connected && (
            <div className="w-full bg-red-950/80 border border-red-850 text-red-200 text-xs text-center py-2.5 px-4 rounded-xl mb-4 animate-pulse">
              ⚠️ Disconnected from chess server. Attempting to reconnect...
            </div>
          )}

          <GameStatusBar
            turn={gameState.turn}
            isGameOver={gameState.game.isGameOver() || localResult !== null}
            isCheckmate={gameState.game.isCheckmate()}
            isDraw={gameState.game.isDraw()}
            inCheck={gameState.game.inCheck()}
            gameMode={gameMode}
            joinedRoom={socketState.joinedRoom}
            inQueue={socketState.inQueue}
            userRating={socketState.userRating}
          />

          <div className="flex flex-col lg:flex-row items-center gap-4 w-full justify-center">
            <CapturedPieces
              pieces={gameState.capturedWhite}
              colorClass="text-zinc-100"
            />

            <div className="relative w-full max-w-[560px] aspect-square">
              <Board
                position={gameState.fen}
                flipped={gameState.flipped}
                onPieceDrop={handlePieceDrop}
                squareStyles={gameState.getSquareStyles()}
                onSquareClick={handleSquareClick}
              />
              {overlayConfig && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-white/10 backdrop-blur-md transition-all duration-300 z-30 ${overlayConfig.bgClass}`}>
                  <h3 className="text-3xl font-extrabold tracking-tight mb-2">
                    {overlayConfig.title}
                  </h3>
                  <p className="text-sm opacity-90 mb-6 max-w-xs">
                    {overlayConfig.description}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setLocalResult(null)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-md cursor-pointer transition-colors ${overlayConfig.buttonClass}`}
                    >
                      Close Overlay
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shadow-md cursor-pointer border border-zinc-700/50 transition-colors"
                    >
                      New Match
                    </button>
                  </div>
                </div>
              )}
            </div>

            <CapturedPieces
              pieces={gameState.capturedBlack}
              colorClass="text-zinc-950"
            />
          </div>
        </div>

        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 w-full">
          <GameControls
            gameMode={gameMode}
            autoFlip={gameState.autoFlip}
            flipped={gameState.flipped}
            hasHistory={gameState.game.history().length > 0}
            joinedRoom={socketState.joinedRoom}
            playerColor={socketState.playerColor}
            inQueue={socketState.inQueue}
            userRating={socketState.userRating}
            roomCode={socketState.roomCode}
            isGameOver={gameState.game.isGameOver() || localResult !== null}
            onGameModeChange={handleGameModeChange}
            onAutoFlipToggle={gameState.handleAutoFlipToggle}
            onFlipBoard={handleFlipBoard}
            onUndo={handleUndo}
            onReset={handleReset}
            onReturnHome={onReturnHome}
            onUserRatingChange={socketState.setUserRating}
            onRoomCodeChange={socketState.setRoomCode}
            onJoinQueue={socketState.handleJoinQueue}
            onLeaveQueue={socketState.handleLeaveQueue}
            onJoinRoom={socketState.handleJoinOnlineRoom}
            onResign={handleResign}
          />
        </div>
      </div>
    </main>
  );
}
