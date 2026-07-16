import { memo } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Chess } from "chess.js";

interface DailyGamesListProps {
  games: any[];
  userId: string;
}

export const DailyGamesList = memo(function DailyGamesList({ games, userId }: DailyGamesListProps) {
  const router = useRouter();

  if (!games || games.length === 0) return null;

  return (
    <div className="bg-cc-bg-card p-5 rounded-3xl border border-cc-border shadow-2xl">
      <div className="border-b border-cc-border-light pb-3 mb-4 flex justify-between items-center">
        <span className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider">
          Active Daily Games
        </span>
        <span className="text-[10px] text-cc-text-secondary font-bold uppercase font-serif">
          {games.length} In Progress
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
        {games.map((game) => {
          const isWhite = game.whitePlayerId === userId;
          const opponent = isWhite ? game.blackPlayer : game.whitePlayer;
          
          const chess = new Chess(game.fen);
          const isWhiteTurn = chess.turn() === 'w';
          const isMyTurn = (isWhite && isWhiteTurn) || (!isWhite && !isWhiteTurn);
          
          const deadlineText = game.deadline 
            ? formatDistanceToNow(new Date(game.deadline), { addSuffix: true }) 
            : "No deadline";

          return (
            <div
              key={game.id}
              onClick={() => router.push(`/play/${game.id}`)}
              className="flex items-center justify-between p-3.5 bg-cc-bg-sidebar/60 border border-cc-border-light/50 rounded-xl hover:bg-cc-bg-hover transition-all cursor-pointer hover:-translate-y-0.5 shadow-sm"
            >
              {/* Left: Status & Timing */}
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isMyTurn ? "bg-cc-green shadow-[0_0_8px_rgba(129,182,76,0.8)] animate-pulse" : "bg-cc-text-muted"
                  }`}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-cc-text-primary">
                    {isMyTurn ? "Your Turn" : "Waiting for Opponent"}
                  </span>
                  <span className={`text-[9px] font-medium ${isMyTurn ? "text-cc-primary" : "text-cc-text-muted"}`}>
                    {isMyTurn ? `Time expires ${deadlineText}` : `Opponent expires ${deadlineText}`}
                  </span>
                </div>
              </div>

              {/* Right: Opponent Info */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end text-right gap-0.5">
                  <span className="text-xs font-serif font-extrabold text-cc-text-primary">
                    {opponent?.name || "Unknown"}
                  </span>
                  <span className="text-[9px] text-cc-text-muted font-bold font-mono">
                    {opponent?.ratingDaily || 1200} Elo
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-cc-bg-input border border-cc-border-light flex items-center justify-center text-xs font-extrabold text-cc-text-primary font-serif uppercase">
                  {opponent?.image ? (
                    <img src={opponent.image} alt={opponent.name} className="w-full h-full object-cover" />
                  ) : (
                    (opponent?.name || "??").slice(0, 2)
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
