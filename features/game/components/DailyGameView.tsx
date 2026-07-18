"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { gameApi, DailyGame } from "../api/gameApi";
import { useGameState } from "../hooks/useGameState";
import { useRef } from "react";
import { Board } from "./Board";
import { CapturedPieces } from "./CapturedPieces";
import { GameStatusBar } from "./GameStatusBar";
import { GameControls } from "./GameControls";
import MoveHistory from "./MoveHistory/MoveHistory";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "react-hot-toast";

interface DailyGameViewProps {
  gameId: string;
}

export default function DailyGameView({ gameId }: DailyGameViewProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const gameState = useGameState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gameData, setGameData] = useState<DailyGame | null>(null);

  const setFenRef = useRef(gameState.setFen);
  useEffect(() => {
    setFenRef.current = gameState.setFen;
  }, [gameState.setFen]);

  const fetchGame = useCallback(async () => {
    try {
      const data = await gameApi.getDailyGame(gameId);
      setGameData(data);
      // We don't overwrite if the user just moved locally unless we want to reset.
      // But for initial load:
      setFenRef.current(data.fen);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
    // No polling, it's daily! But we can poll every 60s if we want.
    const interval = setInterval(fetchGame, 60000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  const handlePieceDrop = useCallback(
    (source: string, target: string): boolean => {
      if (!gameData || !userId) return false;
      const isWhite = gameData.whitePlayerId === userId;
      const isWhiteTurn = gameState.game.turn() === "w";
      
      if ((isWhite && !isWhiteTurn) || (!isWhite && isWhiteTurn)) {
        return false; // Not your turn
      }

      // DailyGames can use PromotionPicker if we wire it up, but since it's custom logic:
      try {
        const moves = gameState.game.moves({ verbose: true });
        const isPromotion = moves.some(m => m.from === source && m.to === target && m.promotion);
        
        // Wait, since DailyGameView has its own move handler, we would need to duplicate PromotionPicker.
        // For now we'll stick to auto-queen here unless we refactor it to use useGameState's picker.
        // Actually, just pass "q" if it's a promotion.
        const move = gameState.game.move({ from: source, to: target, promotion: isPromotion ? "q" : undefined });
        if (!move) return false;

        const nextFen = gameState.game.fen();
        gameState.setFen(nextFen);
        
        // Post move to backend
        gameApi.makeDailyMove(gameId, source, target)
          .then(() => fetchGame())
          .catch(() => {
            gameState.applyUndo();
            toast.error("Move rejected by server. Your move has been reverted.");
          });
        
        return true;
      } catch {
        return false;
      }
    },
    [gameState, gameData, userId, gameId, fetchGame]
  );

  const handleSquareClick = useCallback(
    (square: string) => {
      gameState.handleSquareClick(
        square,
        "pvp", // Hack to reuse local logic but override drop
        "",
        null,
        null
      );
    },
    [gameState]
  );

  if (loading) return <main className="min-h-screen bg-cc-bg-page flex items-center justify-center p-6"><Spinner /></main>;
  if (error || !gameData) return <main className="min-h-screen bg-cc-bg-page flex items-center justify-center p-6 text-red-500">{error}</main>;

  const isFlipped = gameData.blackPlayerId === userId;
  const selfPlayer = isFlipped ? gameData.blackPlayer : gameData.whitePlayer;
  const oppPlayer = isFlipped ? gameData.whitePlayer : gameData.blackPlayer;

  return (
    <main className="min-h-screen bg-cc-bg-sidebar py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden text-cc-text-primary font-sans">
      <div className="grid-background"></div>
      
      <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-6 relative z-10 items-center xl:items-start justify-center mt-6">
        {/* Left Side: Game Status & Controls */}
        <div className="w-full xl:w-72 flex flex-col gap-4">
          <GameStatusBar
            turn={gameState.game.turn()}
            isCheckmate={gameState.game.isCheckmate()}
            isDraw={gameState.game.isDraw()}
            inCheck={gameState.game.inCheck()}
            gameMode="pvp" // Fallback
            joinedRoom=""
            inQueue={false}
            userRating={1200}
          />

          <div className="flex gap-4 w-full">
            <div className="flex-1 bg-cc-bg-card border border-cc-border shadow-md rounded-2xl p-4 flex flex-col items-center justify-center min-h-[96px]">
              <span className="text-xs font-semibold text-cc-text-secondary uppercase tracking-widest font-serif mb-2">Turn Status</span>
              <span className="text-xl font-bold font-sans">
                {gameState.game.turn() === (isFlipped ? 'b' : 'w') ? "Your Turn" : "Waiting..."}
              </span>
            </div>
          </div>

          <GameControls
            gameMode="pvp"
            autoFlip={gameState.autoFlip}
            flipped={gameState.flipped}
            hasHistory={gameState.game.history().length > 0}
            joinedRoom=""
            playerColor={null}
            isGameOver={gameState.game.isGameOver()}
            viewMode="2d"
            onViewModeChange={() => {}}
            onAutoFlipToggle={gameState.handleAutoFlipToggle}
            onFlipBoard={() => gameState.setFlipped(!gameState.flipped)}
            onUndo={() => {}}
            onReset={() => {}}
            onReturnHome={() => router.push('/')}
            onResign={() => {}}
          />
        </div>

        {/* Center: The Board */}
        <div className="w-full max-w-[min(65vh,100vw-32px)] xl:max-w-[70vh] flex flex-col items-center gap-3 relative select-none">
          <CapturedPieces pieces={gameState.capturedWhite} colorClass="text-zinc-100" />
          
          <div className="w-full relative shadow-2xl rounded-sm">
            <Board
              position={gameState.fen}
              onPieceDrop={handlePieceDrop}
              onSquareClick={handleSquareClick}
              flipped={isFlipped ? !gameState.flipped : gameState.flipped}
              squareStyles={gameState.getSquareStyles()}
              viewMode="2d"
            />
          </div>
        </div>

        {/* Right Side: Move History */}
        <div className="w-full xl:w-72 flex flex-col gap-4 h-[400px] xl:h-[min(70vh,800px)]">
          <div className="h-full bg-cc-bg-card border border-cc-border rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="p-4 bg-cc-bg-card border-b border-cc-border-light flex justify-between items-center z-10 shrink-0">
              <h3 className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-widest">
                Match Record
              </h3>
            </div>
            <MoveHistory
              game={gameState.game}
              viewMoveIndex={gameState.viewMoveIndex}
              onSelectMoveIndex={gameState.setViewMoveIndex}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
