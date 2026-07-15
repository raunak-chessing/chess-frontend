import { memo } from "react";

interface UserCompact {
  id: string;
  name: string;
  image?: string | null;
  ratingBullet: number;
  ratingBlitz: number;
  ratingRapid: number;
  ratingDaily: number;
}

interface RecentGame {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string;
  whitePlayer: UserCompact;
  blackPlayer: UserCompact | null;
  winner: string | null;
  status: string;
  timeControl: string;
  gameType: string;
  createdAt: string;
}

interface RecentGamesProps {
  recentGames: RecentGame[];
  userId: string;
}

export const RecentGames = memo(function RecentGames({ recentGames, userId }: RecentGamesProps) {
  const getRatingForType = (player: UserCompact | null, type: string): number => {
    if (!player) return 1200;
    const lowerType = type.toLowerCase();
    if (lowerType === "bullet") return player.ratingBullet;
    if (lowerType === "blitz") return player.ratingBlitz;
    if (lowerType === "rapid") return player.ratingRapid;
    if (lowerType === "daily") return player.ratingDaily;
    return 1200;
  };

  return (
    <div className="bg-cc-bg-card p-5 rounded-3xl border border-cc-border shadow-2xl">
      <div className="border-b border-cc-border-light pb-3 mb-4 flex justify-between items-center">
        <span className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider">
          Recent Matches
        </span>
        <span className="text-[10px] text-cc-text-secondary font-bold uppercase font-serif">Last 10 Games</span>
      </div>

      {recentGames.length === 0 ? (
        <div className="py-12 text-center text-cc-text-muted text-xs italic">
          No matches found on record.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          {recentGames.map((game) => {
            const isWhite = game.whitePlayerId === userId;
            const selfPlayer = isWhite ? game.whitePlayer : game.blackPlayer;
            const opponentPlayer = isWhite ? game.blackPlayer : game.whitePlayer;

            const isDraw = game.winner === "DRAW";
            const didWin = !isDraw && ((isWhite && game.winner === "WHITE") || (!isWhite && game.winner === "BLACK"));
            const didLose = !isDraw && !didWin;

            const selfRating = getRatingForType(selfPlayer, game.gameType);
            const oppRating = getRatingForType(opponentPlayer, game.gameType);

            const matchDate = new Date(game.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={game.id}
                className="flex items-center justify-between p-3.5 bg-cc-bg-sidebar/60 border border-cc-border-light/50 rounded-xl hover:bg-cc-bg-hover transition-colors"
              >
                {/* Left: Mode icon & Outcome badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold border ${
                      didWin
                        ? "bg-cc-green/10 border-cc-green/40 text-cc-green"
                        : didLose
                        ? "bg-red-500/10 border-red-500/40 text-red-500"
                        : "bg-cc-bg-input/60 border-cc-border text-cc-text-secondary"
                    }`}
                  >
                    {didWin ? "W" : didLose ? "L" : "D"}
                  </span>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-cc-text-primary flex items-center gap-1">
                      {game.gameType} <span className="text-[9px] text-cc-text-primary/70 font-mono font-normal">({game.timeControl})</span>
                    </span>
                    <span className="text-[9px] text-cc-text-muted font-medium">{matchDate}</span>
                  </div>
                </div>

                {/* Right: Opponent details */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end text-right gap-0.5">
                    <span className="text-xs font-serif font-extrabold text-cc-text-primary">
                      {opponentPlayer ? opponentPlayer.name : "Computer Bot"}
                    </span>
                    <span className="text-[9px] text-cc-text-muted font-bold font-mono">
                      Rating: {opponentPlayer ? oppRating : 1200} Elo
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-cc-bg-input border border-cc-border-light flex items-center justify-center text-xs font-extrabold text-cc-text-primary font-serif uppercase">
                    {opponentPlayer?.image ? (
                      <img src={opponentPlayer.image} alt={opponentPlayer.name} className="w-full h-full object-cover" />
                    ) : (
                      (opponentPlayer ? opponentPlayer.name : "AI").slice(0, 2)
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
