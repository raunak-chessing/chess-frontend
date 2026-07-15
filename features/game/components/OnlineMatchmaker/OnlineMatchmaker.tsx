import { memo, useState, useEffect, useCallback } from "react";

interface OnlineMatchmakerProps {
  joinedRoom: string;
  playerColor: "w" | "b" | null;
  inQueue: boolean;
  userRating: number;
  roomCode: string;
  timeControl: string;
  onTimeControlChange: (tc: string) => void;
  onRoomCodeChange: (code: string) => void;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onJoinRoom: () => void;
}

import { TIME_CONTROLS } from "../../constants/setupOptions";
import { SelectableCard } from "../../../../components/ui/SelectableCard";
import { SectionHeader } from "../../../../components/ui/SectionHeader";
import { Card } from "../../../../components/ui/Card";

function getTimeControlInfo(tc: string) {
  const preset = TIME_CONTROLS.find((t) => t.value === tc);
  if (preset) return preset;

  if (tc.toLowerCase().includes("day")) {
    return { name: tc, value: tc, type: "Daily" };
  }

  const parts = tc.split(/[|+]/);
  if (parts.length === 0) return { name: "Custom", value: tc, type: "Rapid" };

  const baseMinutes = parseFloat(parts[0]);
  if (isNaN(baseMinutes)) return { name: "Custom", value: tc, type: "Rapid" };

  const incrementSeconds = parts.length > 1 ? parseFloat(parts[1]) : 0;
  const totalSeconds = baseMinutes * 60 + 40 * (isNaN(incrementSeconds) ? 0 : incrementSeconds);

  let type = "Rapid";
  if (totalSeconds < 180) {
    type = "Bullet";
  } else if (totalSeconds < 600) {
    type = "Blitz";
  }

  return {
    name: `${baseMinutes}+${incrementSeconds}`,
    value: tc,
    type,
  };
}

const OnlineMatchmaker = memo(function OnlineMatchmaker({
  joinedRoom,
  playerColor,
  inQueue,
  userRating,
  roomCode,
  timeControl,
  onTimeControlChange,
  onRoomCodeChange,
  onJoinQueue,
  onLeaveQueue,
  onJoinRoom,
}: OnlineMatchmakerProps) {
  const [elapsed, setElapsed] = useState(0);

  // Custom values state
  const [isCustom, setIsCustom] = useState(false);
  const [customBase, setCustomBase] = useState(10);
  const [customInc, setCustomInc] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (inQueue) {
      setElapsed(0);
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inQueue]);

  // Sync isCustom flag on load/mount or external timeControl change
  useEffect(() => {
    const isPreset = TIME_CONTROLS.some((t) => t.value === timeControl);
    setIsCustom(!isPreset);
  }, [timeControl]);

  const handleCustomChange = useCallback((base: number, inc: number) => {
    setCustomBase(base);
    setCustomInc(inc);
    onTimeControlChange(`${base}|${inc}`);
  }, [onTimeControlChange]);

  const handleSelectPreset = useCallback((val: string) => {
    setIsCustom(false);
    onTimeControlChange(val);
  }, [onTimeControlChange]);

  const handleSelectCustomMode = useCallback(() => {
    setIsCustom(true);
    onTimeControlChange(`${customBase}|${customInc}`);
  }, [onTimeControlChange, customBase, customInc]);

  const allowedDiff = 100 + elapsed * 10;
  const minRating = Math.max(0, Math.round(userRating - allowedDiff));
  const maxRating = Math.round(userRating + allowedDiff);

  const activeTC = getTimeControlInfo(timeControl);

  return (
    <Card className="flex flex-col gap-4 mt-1.5 transition-all duration-300">
      <span className="text-xs font-bold border-b pb-2 tracking-wider font-sans uppercase text-cc-text-primary border-cc-border-light">
        Live Matchmaking
      </span>

      {joinedRoom ? (
        <div className="flex flex-col gap-2.5 text-xs p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
          <span className="text-cc-green font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cc-green animate-pulse" />
            Active Match: {joinedRoom.slice(0, 12)}...
          </span>
          <span className="text-zinc-300 font-semibold">
            Color: <span className="text-cc-text-primary uppercase font-bold">{playerColor === "w" ? "White" : "Black"}</span>
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {inQueue ? (
            <div className="flex flex-col gap-3.5 items-center justify-center p-4 bg-slate-950/40 rounded-xl border border-slate-900/60 relative overflow-hidden">
              <span className="w-8 h-8 border-3 border-cc-green border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(129,182,76,0.2)]" />
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-xs font-bold text-zinc-100 animate-pulse">
                  Searching for Opponent...
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  Pool: <span className="text-cc-text-primary font-semibold">{activeTC.type} ({activeTC.name})</span>
                </span>
                <span className="text-[10px] text-cc-text-primary font-semibold bg-cc-bg-sidebar px-2 py-0.5 rounded border border-cc-border-light mt-1">
                  Range: {minRating} - {maxRating} Elo
                </span>
                <span className="text-[9px] text-slate-500 font-mono mt-1">
                  Elapsed: {elapsed}s
                </span>
              </div>
              <button
                onClick={onLeaveQueue}
                className="w-full mt-2 py-2 text-xs font-bold rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 hover:text-white border border-red-800/40 active:scale-95 transition-all duration-300 cursor-pointer shadow-md"
              >
                Cancel Search
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <SectionHeader>Select Time Control</SectionHeader>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_CONTROLS.map((tc) => {
                    const isActive = !isCustom && timeControl === tc.value;
                    return (
                      <SelectableCard
                        key={tc.value}
                        isActive={isActive}
                        onClick={() => handleSelectPreset(tc.value)}
                        className="py-2 px-1 text-[10px] font-bold rounded-xl flex flex-col items-center justify-center gap-0.5 select-none"
                      >
                        <span>{tc.name}</span>
                        <span className="text-[8px] opacity-70 font-semibold">{tc.type}</span>
                      </SelectableCard>
                    );
                  })}
                  <SelectableCard
                    isActive={isCustom}
                    onClick={handleSelectCustomMode}
                    className="py-2 px-1 text-[10px] font-bold rounded-xl flex flex-col items-center justify-center gap-0.5 select-none"
                  >
                    <span>Custom</span>
                    <span className="text-[8px] opacity-70 font-semibold">Set format</span>
                  </SelectableCard>
                </div>
              </div>

              {isCustom && (
                <div className="flex gap-3 border p-3 rounded-xl bg-cc-bg-input border-cc-border-light">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase font-sans text-cc-text-secondary">Minutes</label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={customBase}
                      onChange={(e) => handleCustomChange(Math.max(1, parseInt(e.target.value) || 1), customInc)}
                      className="w-full text-center py-1.5 rounded-lg text-xs font-bold font-mono outline-none border transition-colors bg-cc-bg-sidebar text-cc-text-primary border-cc-border"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase font-sans text-cc-text-secondary">Increment (s)</label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={customInc}
                      onChange={(e) => handleCustomChange(customBase, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center py-1.5 rounded-lg text-xs font-bold font-mono outline-none border transition-colors bg-cc-bg-sidebar text-cc-text-primary border-cc-border"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center border px-3.5 py-2.5 rounded-xl bg-cc-bg-sidebar border-cc-border">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase font-sans text-cc-text-secondary">Rating Pool</span>
                  <span className="text-xs font-bold text-cc-text-primary">
                    {activeTC.type} Chess
                  </span>
                </div>
                <span className="text-sm font-extrabold font-mono border px-2.5 py-1 rounded-lg bg-cc-bg-input text-cc-text-primary border-cc-border-light">
                  {userRating} Elo
                </span>
              </div>

              <button
                onClick={onJoinQueue}
                className="w-full py-3 rounded-xl text-white font-black text-sm tracking-wide cursor-pointer transition-all active:translate-y-[4px] bg-cc-green hover:bg-cc-green-hover shadow-[0_4px_0_var(--cc-green-dark)] active:shadow-none border border-transparent"
              >
                Find Opponent
              </button>

              <div className="relative flex items-center justify-center my-1.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cc-border"></div>
                </div>
                <span className="relative px-3 text-[10px] font-bold uppercase font-sans bg-cc-bg-card text-cc-text-muted">or</span>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1.5">
                  <SectionHeader>Join Private Room</SectionHeader>
                  <input
                    type="text"
                    placeholder="Enter Room Code..."
                    value={roomCode}
                    onChange={(e) => onRoomCodeChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl font-semibold outline-none transition-all font-sans bg-cc-bg-input text-cc-text-primary border-cc-border"
                  />
                </div>
                <button
                  onClick={onJoinRoom}
                  disabled={roomCode.trim() === ""}
                  className="w-full py-2.5 text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed border transition-all cursor-pointer select-none bg-cc-bg-input text-cc-text-primary border-cc-border-light hover:bg-cc-bg-hover"
                >
                  Join Room
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
});

export default OnlineMatchmaker;
