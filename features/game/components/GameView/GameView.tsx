"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { GameMode, GameVariant } from "../../types/game.types";
import { useGameState } from "../../hooks/useGameState";
import { useGameSocket } from "../../hooks/useGameSocket";
import { useChessEngine } from "../../hooks/useChessEngine";
import { Board } from "../Board";
import { CapturedPieces } from "../CapturedPieces";
import { GameStatusBar } from "../GameStatusBar";
import { GameControls } from "../GameControls";
import { EvaluationBar } from "../EvaluationBar/EvaluationBar";
import MoveHistory from "../MoveHistory/MoveHistory";
import { GameReview } from "../GameReview/GameReview";
import { PuzzleRush } from "../PuzzleRush/PuzzleRush";
import { OnlineMatchmaker } from "../OnlineMatchmaker";
import { GameChat } from "../GameChat";
import { TIME_CONTROLS, CHESS_VARIANTS, COMPUTER_OPPONENTS, GAME_MODE_TABS } from "../../constants/setupOptions";
import { Card } from "../../../../components/ui/Card";
import { SelectableCard } from "../../../../components/ui/SelectableCard";
import { SectionHeader } from "../../../../components/ui/SectionHeader";
import { formatTime } from "../../../../lib/utils";
import { useVoiceControl } from "../../hooks/useVoiceControl";
import { useVoiceAnnouncer } from "../../hooks/useVoiceAnnouncer";

interface GameViewProps {
  initialMode: GameMode;
  onReturnHome: () => void;
}

export default function GameView({ initialMode, onReturnHome }: GameViewProps) {
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [localResult, setLocalResult] = useState<"won" | "lost" | "draw" | "opponent-disconnected" | "opponent-resigned" | null>(null);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [viewMode, setViewMode] = useState<"3d" | "2.5d" | "2d">("3d");
  const [showReview, setShowReview] = useState(false);
  const [isBlindfold, setIsBlindfold] = useState(false);

  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  // Setup lobby states
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<number>(3);
  const [selectedVariant, setSelectedVariant] = useState<GameVariant>("standard");
  const [localTimeControl, setLocalTimeControl] = useState("10|0");
  const [botSide, setBotSide] = useState<"w" | "b" | "random">("random");

  const [openingName, setOpeningName] = useState<string | null>(null);

  const gameState = useGameState();

  const activeBot = useMemo(() => COMPUTER_OPPONENTS.find((b) => b.id === botDifficulty), [botDifficulty]);

  if (gameMode === "puzzle-rush") {
    return (
      <main className="min-h-screen bg-cc-bg-page py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="grid-background"></div>
        <PuzzleRush onReturnHome={onReturnHome} />
      </main>
    );
  }

  const handleResetTimers = useCallback(() => {
    if (localTimeControl === "unlimited") {
      setWhiteTime(999999);
      setBlackTime(999999);
    } else {
      const mins = parseInt(localTimeControl.split("|")[0]) || 10;
      setWhiteTime(mins * 60);
      setBlackTime(mins * 60);
    }
  }, [localTimeControl]);

  const socketHandlers = useMemo(
    () => ({
      applyMove: gameState.applyMove,
      applyUndo: gameState.applyUndo,
      resetGame: () => {
        setLocalResult(null);
        setOverlayDismissed(false);
        handleResetTimers();
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
    [gameState, handleResetTimers],
  );

  const socketState = useGameSocket(socketHandlers);

  // Apply a move explicitly for Voice Control (which can take SAN or {from, to})
  const handleVoiceMove = useCallback((move: string | { from: string; to: string }) => {
    if (gameState.game.isGameOver() || localResult !== null) return false;
    // Disallow if it's not our turn
    const isOurTurn = 
      (gameMode === "online" && socketState.playerColor === gameState.turn) ||
      (gameMode === "computer-black" && gameState.turn === "w") ||
      (gameMode === "computer-white" && gameState.turn === "b") ||
      (gameMode === "pvp");

    if (!isOurTurn) return false;

    // We try to find the move in legal moves to get the exact SAN
    const legalMoves = gameState.game.moves({ verbose: true });
    let matchedMove = null;

    if (typeof move === "string") {
      matchedMove = legalMoves.find(m => m.san.toLowerCase() === move.toLowerCase() || m.san.replace(/[+#]/,'').toLowerCase() === move.toLowerCase());
    } else {
      matchedMove = legalMoves.find(m => m.from === move.from && m.to === move.to);
    }

    if (!matchedMove) return false;

    const success = gameState.applyMove(matchedMove.san);
    if (success && gameMode === "online" && socketState.joinedRoom) {
      socketState.socket.emit("move", {
        room: socketState.joinedRoom,
        move: matchedMove.san,
      });
    }
    return success;
  }, [gameState, gameMode, localResult, socketState]);

  const { isListening, toggleListening } = useVoiceControl(handleVoiceMove);

  const historyLength = gameState.game.history().length;
  const lastMoveSan = historyLength > 0 ? gameState.game.history()[historyLength - 1] : null;
  const turn = gameState.game.turn();
  const isOpponentMoveNow = 
      (gameMode === "online" && socketState.playerColor === turn) ||
      (gameMode === "computer-black" && turn === "w") ||
      (gameMode === "computer-white" && turn === "b");
  
  // If it's our turn now, it means the opponent just moved!
  useVoiceAnnouncer(historyLength, lastMoveSan, isOpponentMoveNow, isBlindfold);

  // Auto-dismiss setup lobby when an online match is successfully found
  useEffect(() => {
    if (socketState.joinedRoom && !isSetupComplete) {
      setIsSetupComplete(true);
    }
  }, [socketState.joinedRoom, isSetupComplete]);

  let derivedResult: "won" | "lost" | "draw" | "opponent-disconnected" | "opponent-resigned" | null = localResult;

  if (!derivedResult && gameState.variantWinner !== null) {
    if (gameMode === "online") {
      derivedResult = socketState.playerColor === gameState.variantWinner ? "won" : "lost";
    } else if (gameMode === "computer-black") {
      derivedResult = gameState.variantWinner === "w" ? "won" : "lost";
    } else if (gameMode === "computer-white") {
      derivedResult = gameState.variantWinner === "b" ? "won" : "lost";
    } else {
      derivedResult = gameState.variantWinner === "w" ? "won" : "lost";
    }
  }

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

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const isGameOver = gameState.game.isGameOver() || localResult !== null;
    const hasHistory = gameState.game.history().length > 0;

    if (hasHistory && !isGameOver) {
      interval = setInterval(() => {
        const turn = gameState.game.turn();
        if (turn === "w") {
          setWhiteTime((prev) => {
            if (prev <= 1) {
              setLocalResult(gameMode === "online" ? (socketState.playerColor === "w" ? "lost" : "won") : "lost");
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 1) {
              setLocalResult(gameMode === "online" ? (socketState.playerColor === "b" ? "lost" : "won") : "won");
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.fen, gameState.game, gameMode, socketState.playerColor, localResult]);

  useEffect(() => {
    // Premove execution logic
    const isTurn =
      (gameMode === "online" && socketState.playerColor === gameState.turn) ||
      (gameMode === "computer-black" && gameState.turn === "w") ||
      (gameMode === "computer-white" && gameState.turn === "b") ||
      gameMode === "pvp";

    if (isTurn && gameState.premoveQueue.length > 0 && !gameState.game.isGameOver()) {
      const pm = gameState.premoveQueue[0];
      const success = gameState.handlePieceDrop(
        pm.from,
        pm.to,
        gameMode,
        socketState.joinedRoom,
        socketState.playerColor,
        socketState.socket,
      );
      if (!success) {
        gameState.clearPremoves();
      }
    }
  }, [
    gameState.turn,
    gameState.premoveQueue,
    gameMode,
    socketState.playerColor,
    socketState.joinedRoom,
    socketState.socket,
    gameState,
  ]);

  // Fetch opening name for the first 15 moves
  useEffect(() => {
    if (gameState.game.history().length > 15) return;
    
    const fetchOpening = async () => {
      try {
        const res = await fetch(`https://explorer.lichess.ovh/master?fen=${encodeURIComponent(gameState.fen)}`);
        const data = await res.json();
        if (data.opening && data.opening.name) {
          setOpeningName(data.opening.name);
        }
      } catch (e) {
        // silently ignore
      }
    };

    const timer = setTimeout(fetchOpening, 500);
    return () => clearTimeout(timer);
  }, [gameState.fen, gameState.game]);

  useChessEngine({
    game: gameState.game,
    fen: gameState.fen,
    gameMode,
    autoFlip: gameState.autoFlip,
    applyMove: gameState.applyMove,
    botDifficulty,
  });

  const handleGameModeChange = useCallback(
    (mode: GameMode) => {
      setLocalResult(null);
      setOverlayDismissed(false);
      handleResetTimers();
      setGameMode(mode);
      gameState.resetGame(mode === "computer-white");
    },
    [gameState, handleResetTimers],
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
    handleResetTimers();
    gameState.handleReset(gameMode, socketState.joinedRoom, socketState.socket);
  }, [gameState, gameMode, socketState.joinedRoom, socketState.socket, handleResetTimers]);

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
    let title = "🎉 Victory!";
    let description = "You won the match!";

    if (gameState.variantWinner !== null) {
      const vName = gameState.variant === "three-check" ? "Three-Check" : "King of the Hill";
      const winnerColorName = gameState.variantWinner === "w" ? "White" : "Black";
      if (gameMode === "pvp") {
        title = `🎉 ${winnerColorName} Wins!`;
        description = `${vName} objective completed!`;
      } else {
        const didIWin = gameMode === "online"
          ? socketState.playerColor === gameState.variantWinner
          : (gameMode === "computer-black" ? gameState.variantWinner === "w" : gameState.variantWinner === "b");
        if (didIWin) {
          title = "🎉 Victory!";
          description = `You completed the ${vName} goal!`;
        } else {
          title = "🏳️ Defeat";
          description = `Your opponent completed the ${vName} goal.`;
        }
      }
    } else {
      if (derivedResult === "lost") {
        title = "🏳️ Defeat";
        description = "You lost this match.";
      } else if (derivedResult === "draw") {
        title = "🤝 Draw";
        description = "The game ended in a draw.";
      } else if (derivedResult === "opponent-disconnected") {
        title = "🔌 Opponent Disconnected";
        description = "Your opponent left the game.";
      } else if (derivedResult === "opponent-resigned") {
        title = "🎉 Victory by Resignation!";
        description = "Your opponent resigned.";
      }
    }

    switch (derivedResult) {
      case "won":
      case "opponent-resigned":
        return {
          title,
          description,
          bgClass: "bg-cc-bg-sidebar/95 border-cc-border-hover/20 text-cc-text-primary font-serif",
          buttonClass: "bg-emerald-700 hover:bg-emerald-600 text-white",
        };
      case "lost":
        return {
          title,
          description,
          bgClass: "bg-cc-bg-sidebar/95 border-cc-border-hover/20 text-cc-text-primary font-serif",
          buttonClass: "bg-red-900 hover:bg-red-800 text-red-100",
        };
      case "draw":
        return {
          title,
          description,
          bgClass: "bg-[var(--cc-bg-card)] border-[var(--cc-border-light)] text-[var(--cc-text-primary)] font-sans",
          buttonClass: "bg-[var(--cc-bg-input)] hover:bg-[var(--cc-bg-hover)] text-white",
        };
      case "opponent-disconnected":
        return {
          title,
          description,
          bgClass: "bg-[var(--cc-bg-card)] border-[var(--cc-border-light)] text-[var(--cc-text-primary)] font-sans",
          buttonClass: "bg-amber-700 hover:bg-amber-600 text-white",
        };
      default:
        return null;
    }
  };

  const overlayConfig = getOverlayConfig();

  const selfColor = gameMode === "online" ? (socketState.playerColor || "w") : "w";
  const selfChecks = selfColor === "w" ? gameState.whiteChecks : gameState.blackChecks;
  const oppChecks = selfColor === "w" ? gameState.blackChecks : gameState.whiteChecks;

  const playerLeftTime =
    gameMode === "online"
      ? socketState.playerColor === "b"
        ? blackTime
        : whiteTime
      : gameMode === "computer-white"
      ? blackTime
      : whiteTime;

  const playerRightTime =
    gameMode === "online"
      ? socketState.playerColor === "b"
        ? whiteTime
        : blackTime
      : gameMode === "computer-white"
      ? whiteTime
      : blackTime;

  if (!isSetupComplete) {
    return (
      <main className="min-h-screen w-full flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden bg-cc-bg-sidebar text-cc-text-primary">
        <div className="grid-background"></div>
        <Card className="w-full max-w-xl flex flex-col gap-6 relative z-10">
          
          <div className="flex justify-between items-center border-b pb-4 border-cc-border-light">
            <h2 className="text-2xl font-bold font-sans tracking-tight text-cc-text-primary">
              {gameMode === "online" ? "Play Online" : (gameMode === "pvp" ? "Play Locally" : "Play vs Computer")}
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
                gameState.resetGameWithVariant(selectedVariant, flip);
                setIsSetupComplete(true);
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

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center md:p-6 font-sans bg-cc-bg-page text-cc-text-primary">
      <div className="w-full  flex flex-col items-center justify-center">
        
        <div className="w-full flex items-center justify-between gap-4 mb-6 header-container-responsive">
          <div className="flex flex-col gap-1.5 items-start">
            <div className="px-3 py-1.5 rounded-xl flex items-center gap-3 w-40 md:w-52 h-14 justify-between border bg-cc-bg-card border-cc-border">
              <span className="font-bold text-sm md:text-base tracking-wide truncate max-w-[160px] md:max-w-[200px] text-cc-text-primary">
                {socketState.selfPlayer ? `${socketState.selfPlayer.name} (${socketState.selfPlayer.rating})` : "You"}
              </span>
            </div>
            {gameState.variant === "three-check" && (
              <div className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider ml-1">
                Checks: {selfChecks} / 3
              </div>
            )}
            <div className="w-28 md:w-36 h-11 md:h-12 rounded-xl flex items-center justify-center font-mono text-2xl md:text-3xl font-extrabold tracking-widest border bg-cc-bg-input border-cc-border text-cc-text-primary">
              {formatTime(playerLeftTime)}
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
                {socketState.opponent ? `${socketState.opponent.name} (${socketState.opponent.rating})` : (gameMode === "online" ? "Opponent" : gameMode === "pvp" ? "Black" : activeBot ? `${activeBot.name} (${activeBot.elo})` : "AI")}
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
            <div className="w-28 md:w-36 h-11 md:h-12 rounded-xl flex items-center justify-center font-mono text-2xl md:text-3xl font-extrabold tracking-widest border bg-cc-bg-input border-cc-border text-cc-text-primary">
              {formatTime(playerRightTime)}
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

        <div className="flex flex-col lg:flex-row items-center gap-4 justify-center w-full">
          <div className="order-3 lg:order-1 flex w-full lg:w-auto justify-center">
            <CapturedPieces
              pieces={gameState.capturedWhite}
              colorClass="text-zinc-100"
              boardHeightClass="captured-tray-responsive"
            />
          </div>

          <div className="order-1 lg:order-2 flex items-center gap-3">
            <div className="evaluation-bar-responsive">
              <EvaluationBar
                fen={gameState.fen}
                turn={gameState.turn}
                isGameOver={gameState.game.isGameOver() || localResult !== null}
              />
            </div>
            <div className={`chess-3d-scene flex items-center justify-center board-container-responsive aspect-square relative ${isBlindfold ? "blindfold-mode" : ""}`}>
              <Board
                position={gameState.fen}
                flipped={gameState.flipped}
                viewMode={viewMode}
                onPieceDrop={handlePieceDrop}
                squareStyles={gameState.getSquareStyles()}
                onSquareClick={handleSquareClick}
                onPremoveClear={gameState.clearPremoves}
                isDraggablePiece={({ piece }) => {
                  if (gameState.game.isGameOver() || localResult !== null) return false;
                  // If it's a game mode against bot or local PvP, use normal rules
                  if (gameMode !== "online") {
                    const isAiTurn =
                      (gameMode === "computer-black" && gameState.turn === "b") ||
                      (gameMode === "computer-white" && gameState.turn === "w");
                    if (isAiTurn) return false;
                    return true;
                  }
                  // For online, allow dragging our pieces at any time (for premove)
                  return piece.startsWith(socketState.playerColor || "w");
                }}
              />
                
              {overlayConfig && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-cc-border-light backdrop-blur-md transition-all duration-300 z-30 ${overlayConfig.bgClass}`}>
                  <h3 className="text-3xl font-extrabold tracking-tight mb-2 drop-shadow-md">
                    {overlayConfig.title}
                  </h3>
                  <p className="text-sm opacity-90 mb-6 max-w-xs font-sans">
                    {overlayConfig.description}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setOverlayDismissed(true)}
                      className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-md cursor-pointer transition-colors ${overlayConfig.buttonClass}`}
                    >
                      Close Overlay
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shadow-md cursor-pointer border border-cc-border-light transition-colors"
                    >
                      New Match
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="order-4 lg:order-3 flex w-full lg:w-auto justify-center">
            <CapturedPieces
              pieces={gameState.capturedBlack}
              colorClass="text-zinc-950"
              boardHeightClass="captured-tray-responsive"
            />
          </div>

          <div className="order-2 lg:order-4 flex w-full lg:w-auto justify-center move-history-responsive">
            {showReview ? (
              <GameReview 
                pgn={gameState.game.pgn()}
                whitePlayerName={socketState.selfPlayer?.name || "White"}
                blackPlayerName={socketState.opponent?.name || "Black"}
              />
            ) : (
              <MoveHistory
                game={gameState.game}
                viewMoveIndex={gameState.viewMoveIndex}
                onSelectMoveIndex={gameState.setViewMoveIndex}
                boardHeightClass="h-full"
              />
            )}
            
            {gameMode === "online" && socketState.joinedRoom && (
              <div className="mt-4 w-full h-[200px]">
                <GameChat socket={socketState.socket} room={socketState.joinedRoom} />
              </div>
            )}
          </div>

          <div className="order-5 lg:order-5 flex items-start gap-4 justify-center">
            <GameControls
              gameMode={gameMode}
              autoFlip={gameState.autoFlip}
              flipped={gameState.flipped}
              hasHistory={gameState.game.history().length > 0}
              joinedRoom={socketState.joinedRoom}
              playerColor={socketState.playerColor}
              isGameOver={derivedResult !== null || gameState.game.isGameOver()}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onAutoFlipToggle={gameState.handleAutoFlipToggle}
              onFlipBoard={handleFlipBoard}
              onUndo={handleUndo}
              onReset={handleReset}
              onReturnHome={onReturnHome}
              onResign={handleResign}
              onReviewGame={() => setShowReview(!showReview)}
            />
            
            <button 
              onClick={toggleListening}
              className={`h-14 px-4 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm ${
                isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                  : "bg-cc-bg-surface hover:bg-cc-bg-hover text-cc-text-secondary border border-cc-border"
              }`}
              title="Voice Control"
            >
              🎤 {isListening ? "Listening..." : "Voice"}
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
