import { memo } from "react";

interface OnlineMatchmakerProps {
  joinedRoom: string;
  playerColor: "w" | "b" | null;
  inQueue: boolean;
  userRating: number;
  roomCode: string;
  onUserRatingChange: (rating: number) => void;
  onRoomCodeChange: (code: string) => void;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onJoinRoom: () => void;
}

const OnlineMatchmaker = memo(function OnlineMatchmaker({
  joinedRoom,
  playerColor,
  inQueue,
  userRating,
  roomCode,
  onUserRatingChange,
  onRoomCodeChange,
  onJoinQueue,
  onLeaveQueue,
  onJoinRoom,
}: OnlineMatchmakerProps) {
  return (
    <div className="flex flex-col gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 mt-2">
      <span className="text-xs text-slate-400 font-bold border-b border-slate-800 pb-1">
        Online Matchmaker
      </span>
      {joinedRoom ? (
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-emerald-500 font-bold">
            ✓ Active Match: {joinedRoom}
          </span>
          <span className="text-zinc-400">
            Playing As: {playerColor === "w" ? "White" : "Black"}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {inQueue ? (
            <div className="flex flex-col gap-2 items-center justify-center p-2">
              <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] text-zinc-400 animate-pulse text-center">
                Finding opponent close to {userRating} Elo...
              </span>
              <button
                onClick={onLeaveQueue}
                className="w-full mt-1 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer text-zinc-300"
              >
                Cancel Search
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500">
                  Your Elo Rating
                </span>
                <input
                  type="number"
                  min="0"
                  max="4000"
                  value={userRating}
                  onChange={(e) => onUserRatingChange(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-zinc-200"
                />
              </div>
              <button
                onClick={onJoinQueue}
                className="w-full py-1.5 text-xs font-semibold rounded-lg bg-[#81b64c] hover:bg-[#a3d16c] text-white transition-colors cursor-pointer"
              >
                Find Opponent
              </button>

              <div className="w-full h-px bg-slate-800/80 my-1" />

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500">
                  Or Join via Room Code
                </span>
                <input
                  type="text"
                  placeholder="Enter Code..."
                  value={roomCode}
                  onChange={(e) => onRoomCodeChange(e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-zinc-200 animate-none"
                />
              </div>
              <button
                onClick={onJoinRoom}
                className="w-full py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer text-zinc-200"
              >
                Join Room
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default OnlineMatchmaker;
