"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import { ConsentDialog } from "../ConsentDialog";
import { GameChat } from "../GameChat/GameChat";
import { TIME_CONTROLS, CHESS_VARIANTS, COMPUTER_OPPONENTS } from "../../constants/setupOptions";
import { Card } from "../../../../components/ui/Card";
import { SelectableCard } from "../../../../components/ui/SelectableCard";
import { SectionHeader } from "../../../../components/ui/SectionHeader";
import { GameSetupLobby } from "../GameSetupLobby";
import { GameResultOverlay } from "../GameResultOverlay";
import { GameHeader } from "../GameHeader";
import { formatTime } from "../../../../lib/utils";
import { useVoiceControl } from "../../hooks/useVoiceControl";
import { useVoiceAnnouncer } from "../../hooks/useVoiceAnnouncer";
import { useServerClock } from "../../hooks/useServerClock";
import { useOpeningName } from "../../hooks/useOpeningName";
import { usePremoveExecution } from "../../hooks/usePremoveExecution";
import { deriveGameResult, getOverlayConfig } from "../../utils/deriveGameResult";
import { PromotionPicker } from "../PromotionPicker";
import { StreamerHeatmap } from "../../../social/components/StreamerHeatmap";
import { WagerOverlay } from "../../../social/components/WagerOverlay";
import { useEquippedBoardSkin } from "../../../inventory/hooks/useEquippedBoardSkin";

interface GameViewProps {
  initialMode: GameMode;
  onReturnHome: () => void;
}

function GameViewInner({ initialMode, onReturnHome }: GameViewProps) {
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [localResult, setLocalResult] = useState<"won" | "lost" | "draw" | "opponent-disconnected" | "opponent-resigned" | null>(null);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [viewMode, setViewMode] = useState<"3d" | "2.5d" | "2d">("3d");
  const [showReview, setShowReview] = useState(false);
  const [isBlindfold, setIsBlindfold] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const autoJoinAttempted = useRef(false);

  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);

  // Setup lobby states
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<number>(3);
  const [selectedVariant, setSelectedVariant] = useState<GameVariant>("standard");
  const [localTimeControl, setLocalTimeControl] = useState("10|0");
  const [botSide, setBotSide] = useState<"w" | "b" | "random">("random");

  const gameState = useGameState();
  const boardSkin = useEquippedBoardSkin();

  const activeBot = useMemo(() => COMPUTER_OPPONENTS.find((b) => b.id === botDifficulty), [botDifficulty]);

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
      applyUndo: gameState.applyUndo,
      syncGameState: gameState.syncGameState,
      setVariant: gameState.setVariant,
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
      onTimeout: (winner: "w" | "b") => {
        setLocalResult(winner === "w" ? "lost" : "won"); // Rough fallback logic, will be overridden by localResult evaluation logic
        gameState.setVariantWinner(winner);
      },
      onRematchAccepted: (newGameId?: string) => {
        if (newGameId) {
          router.push(`/play/online?gameId=${newGameId}`);
          window.location.href = `/play/online?gameId=${newGameId}`; // Force reload for clean state
        } else {
          gameState.resetGame();
        }
      }
    }),
    [gameState, handleResetTimers, router],
  );

  const socketState = useGameSocket(socketHandlers);

  const handleSelectedVariantChange = useCallback(
    (v: GameVariant) => {
      setSelectedVariant(v);
      socketState.setVariant(v);
    },
    [socketState],
  );

  // Auto-join from challenge
  useEffect(() => {
    if (initialMode === "online" && !autoJoinAttempted.current) {
      const gameId = searchParams.get("gameId");
      if (gameId && socketState.connected && !socketState.joinedRoom && !socketState.inQueue) {
        autoJoinAttempted.current = true;
        socketState.setRoomCode(gameId);
        // We need a short timeout to allow the state to propagate before calling handleJoinOnlineRoom,
        // or we can just emit it directly since we know the code.
        setTimeout(() => {
          socketState.handleJoinOnlineRoom();
        }, 100);
      }
    }
  }, [initialMode, searchParams, socketState]);

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
      matchedMove = legalMoves.find((m: any) => m.san.toLowerCase() === move.toLowerCase() || m.lan === move);
    } else {
      matchedMove = legalMoves.find((m: any) => m.from === move.from && m.to === move.to);
    }

    if (!matchedMove) return false;

    const success = gameState.applyMove(matchedMove.san);
    if (success && gameMode === "online" && socketState.joinedRoom) {
      socketState.socket.emit("make_move", {
        room: socketState.joinedRoom,
        move: `${matchedMove.from}${matchedMove.to}${matchedMove.promotion || ""}`,
      });
    }
    return success;
  }, [gameState, gameMode, localResult, socketState]);

  const { isListening, toggleListening } = useVoiceControl(gameState.game.fen(), handleVoiceMove);

  const historyLength = gameState.game.history().length;
  const lastMoveSan = historyLength > 0 ? gameState.game.history()[historyLength - 1] : null;
  const turn = gameState.game.turn();
  const isOurTurnNow = 
      (gameMode === "online" && socketState.playerColor === turn) ||
      (gameMode === "computer-black" && turn === "w") ||
      (gameMode === "computer-white" && turn === "b");
  
  // If it's our turn now, it means the opponent just moved!
  useVoiceAnnouncer(historyLength, lastMoveSan, isOurTurnNow, isBlindfold);

  // Auto-dismiss setup lobby when an online match is successfully found
  useEffect(() => {
    if (socketState.joinedRoom && !isSetupComplete) {
      setIsSetupComplete(true);
    }
  }, [socketState.joinedRoom, isSetupComplete]);

  const derivedResult = deriveGameResult({
    localResult,
    variantWinner: gameState.variantWinner,
    game: gameState.game,
    gameMode,
    playerColor: socketState.playerColor,
  });

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

    if (hasHistory && !isGameOver && gameMode !== "online") {
      interval = setInterval(() => {
        const turn = gameState.game.turn();
        if (turn === "w") {
          setWhiteTime((prev) => {
            if (prev <= 1) {
              setLocalResult("lost");
              return 0;
            }
            return prev - 1;
          });
        } else {
          setBlackTime((prev) => {
            if (prev <= 1) {
              setLocalResult("won");
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

  const handleServerTimeout = useCallback(() => {
    socketState.handleClaimTimeout();
  }, [socketState.handleClaimTimeout]);

  const serverClock = useServerClock(
    gameState.turn,
    socketState.serverWhiteMs,
    socketState.serverBlackMs,
    socketState.serverSyncTimestamp,
    gameMode === "online" && !gameState.game.isGameOver() && localResult === null,
    handleServerTimeout
  );

  usePremoveExecution(gameState, gameMode, socketState);

  const openingName = useOpeningName(gameState.fen, gameState.game.history().length);

  useChessEngine({
    game: gameState.game,
    fen: gameState.fen,
    gameMode,
    autoFlip: gameState.autoFlip,
    applyMove: gameState.applyMove,
    botDifficulty,
  });



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

  const streamerId = searchParams.get("streamerId");

  const handleSquareClick = useCallback(
    (square: string) => {
      if (streamerId) {
        // Emit spectator vote instead of making a move
        import("../../../social/components/StreamerHeatmap").then(mod => {
          mod.emitStreamerVote(streamerId, square);
        });
        return;
      }

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
    if (gameMode === "online") {
      socketState.requestUndo();
    } else {
      gameState.handleUndo(gameMode, socketState.joinedRoom, socketState.socket);
    }
  }, [gameState, gameMode, socketState]);

  const handleReset = useCallback(() => {
    if (gameMode === "online") {
      socketState.requestRematch();
    } else {
      setLocalResult(null);
      setOverlayDismissed(false);
      handleResetTimers();
      gameState.handleReset(gameMode, socketState.joinedRoom, socketState.socket);
    }
  }, [gameState, gameMode, socketState, handleResetTimers]);

  const handleFlipBoard = useCallback(() => {
    gameState.setFlipped(!gameState.flipped);
  }, [gameState]);

  const handleResign = useCallback(() => {
    if (gameMode === "online" && socketState.joinedRoom) {
      socketState.socket.emit("resign", { room: socketState.joinedRoom });
    }
    setLocalResult("lost");
    setOverlayDismissed(false);
  }, [gameMode, socketState.joinedRoom, socketState.socket]);

  const overlayConfig = getOverlayConfig({
    showOverlay,
    derivedResult,
    variantWinner: gameState.variantWinner,
    variant: gameState.variant,
    gameMode,
    playerColor: socketState.playerColor,
  });

  const selfColor = gameMode === "online" ? (socketState.playerColor || "w") : "w";
  const selfChecks = selfColor === "w" ? gameState.whiteChecks : gameState.blackChecks;
  const oppChecks = selfColor === "w" ? gameState.blackChecks : gameState.whiteChecks;

  const playerLeftTimeStr =
    gameMode === "online"
      ? socketState.playerColor === "b"
        ? serverClock.displayBlackTime
        : serverClock.displayWhiteTime
      : formatTime(gameMode === "computer-white" ? blackTime : whiteTime);

  const playerRightTimeStr =
    gameMode === "online"
      ? socketState.playerColor === "b"
        ? serverClock.displayWhiteTime
        : serverClock.displayBlackTime
      : formatTime(gameMode === "computer-white" ? whiteTime : blackTime);

  if (gameMode === "puzzle-rush") {
    return (
      <main className="min-h-screen bg-cc-bg-page py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="grid-background"></div>
        <PuzzleRush onReturnHome={onReturnHome} />
      </main>
    );
  }

  if (!isSetupComplete) {
    return (
      <GameSetupLobby
        gameMode={gameMode}
        setGameMode={setGameMode}
        onReturnHome={onReturnHome}
        selectedVariant={selectedVariant}
        setSelectedVariant={handleSelectedVariantChange}
        localTimeControl={localTimeControl}
        setLocalTimeControl={setLocalTimeControl}
        botDifficulty={botDifficulty}
        setBotDifficulty={setBotDifficulty}
        botSide={botSide}
        setBotSide={setBotSide}
        isBlindfold={isBlindfold}
        setIsBlindfold={setIsBlindfold}
        socketState={socketState}
        onStartGame={(flip: boolean) => {
          gameState.resetGameWithVariant(selectedVariant, flip);
          setIsTransitioning(true);
          setTimeout(() => {
            setIsSetupComplete(true);
            setIsTransitioning(false);
          }, 800);
        }}
      />
    );
  }

  if (isTransitioning) {
    return (
      <main className="min-h-screen bg-cc-bg-page py-8 px-4 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-amber-500 font-serif text-lg tracking-widest uppercase">Setting up board...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center md:p-6 font-sans bg-cc-bg-page text-cc-text-primary">
      <div className="w-full  flex flex-col items-center justify-center">
        
        <GameHeader
          gameMode={gameMode}
          socketState={socketState}
          gameState={gameState}
          selfChecks={selfChecks}
          oppChecks={oppChecks}
          activeBot={activeBot}
          playerLeftTimeStr={playerLeftTimeStr}
          playerRightTimeStr={playerRightTimeStr}
          serverClock={serverClock}
          openingName={openingName || ""}
        />

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
              {gameMode === "online" && (
                <ConsentDialog
                  type={socketState.consentRequest || socketState.consentPending}
                  isPending={socketState.consentPending !== null}
                  onAccept={() => {
                    if (socketState.consentRequest === "undo") socketState.acceptUndo();
                    if (socketState.consentRequest === "rematch") socketState.acceptRematch();
                    if (socketState.consentRequest === "draw") socketState.acceptDraw();
                  }}
                  onDecline={() => {
                    if (socketState.consentRequest === "undo") socketState.declineUndo();
                    if (socketState.consentRequest === "rematch") socketState.declineRematch();
                    if (socketState.consentRequest === "draw") socketState.declineDraw();
                  }}
                  onCancel={() => {
                    if (socketState.consentPending === "undo") socketState.cancelUndoRequest();
                    if (socketState.consentPending === "rematch") socketState.cancelRematchRequest();
                    if (socketState.consentPending === "draw") socketState.cancelDrawRequest();
                  }}
                />
              )}
              
              <Board
                position={gameState.fen}
                flipped={gameState.flipped}
                viewMode={viewMode}
                onPieceDrop={handlePieceDrop}
                squareStyles={gameState.getSquareStyles()}
                onSquareClick={handleSquareClick}
                onPremoveClear={gameState.clearPremoves}
                skin={boardSkin}
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

              {gameState.pendingPromotion && (
                <PromotionPicker
                  color={gameState.turn}
                  onSelect={(piece) => gameState.resolvePromotion(piece, gameMode, socketState.joinedRoom, socketState.socket)}
                  onCancel={gameState.cancelPromotion}
                />
              )}
                
              {overlayConfig && (
                <GameResultOverlay 
                  config={overlayConfig} 
                  onDismiss={() => setOverlayDismissed(true)} 
                />
              )}
              
              {streamerId && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                  {/* Need to conditionally load or just require it at top */}
                  <StreamerHeatmap streamerId={streamerId} />
                </div>
              )}
            </div>
          </div>

          <div className="order-4 lg:order-3 flex flex-col w-full lg:w-auto justify-center gap-4">
            <CapturedPieces
              pieces={gameState.capturedBlack}
              colorClass="text-zinc-950"
              boardHeightClass="captured-tray-responsive"
            />
            {gameMode === "online" && socketState.playerColor === "s" && socketState.joinedRoom && socketState.selfPlayer && socketState.opponent && (
              <div className="mt-4 w-full">
                <WagerOverlay
                  gameId={socketState.joinedRoom}
                  whitePlayerId={socketState.selfPlayer?.name || ""}
                  blackPlayerId={socketState.opponent?.name || ""}
                  whiteName={socketState.selfPlayer?.name || "White"}
                  blackName={socketState.opponent?.name || "Black"}
                />
              </div>
            )}
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
              onOfferDraw={socketState.requestDraw}
              onAbort={socketState.requestAbort}
              onReviewGame={() => setShowReview(!showReview)}
            />
            
            <button 
              onClick={toggleListening}
              className={`h-14 px-4 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm ${
                isListening 
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" 
                  : "bg-cc-bg-sidebar hover:bg-cc-bg-hover text-cc-text-secondary border border-cc-border"
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

export default function GameView(props: GameViewProps) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-neutral-400">Loading game interface...</div>}>
      <GameViewInner {...props} />
    </Suspense>
  );
}
