"use client";

import { useRouter } from "next/navigation";
import { useDailyGame } from "../hooks/useDailyGame";
import { Board } from "./Board";
import { CapturedPieces } from "./CapturedPieces";
import { GameStatusBar } from "./GameStatusBar";
import { GameControls } from "./GameControls";
import MoveHistory from "./MoveHistory/MoveHistory";
import { PromotionPicker } from "./PromotionPicker";
import { authClient } from "@/lib/auth-client";
import { LoadingState } from "@/components/ui/LoadingState";

interface DailyGameViewProps {
  gameId: string;
}

export default function DailyGameView({ gameId }: DailyGameViewProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const { gameState, loading, error, gameData, handlePieceDrop, resolveDailyPromotion, handleSquareClick } =
    useDailyGame(gameId, userId);

  if (loading) {
    return (
      <main className="min-h-screen bg-cc-bg-page flex items-center justify-center p-6">
        <LoadingState label="Loading daily game…" />
      </main>
    );
  }
  if (error || !gameData) {
    return (
      <main className="min-h-screen bg-cc-bg-page flex items-center justify-center p-6 text-red-500">{error}</main>
    );
  }

  const isFlipped = gameData.blackPlayerId === userId;

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
            />
            {gameState.pendingPromotion && (
              <PromotionPicker
                color={gameState.game.turn()}
                onSelect={resolveDailyPromotion}
                onCancel={() => gameState.setPendingPromotion(null)}
              />
            )}
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
