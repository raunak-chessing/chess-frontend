"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Wifi, Zap, Brain, Target, Globe } from "lucide-react";
import { usePuzzleBattle, BattleDifficulty } from "../../hooks/usePuzzleBattle";
import { PuzzleBattleBoard } from "./PuzzleBattleBoard";
import { PuzzleBattleHUD } from "./PuzzleBattleHUD";
import { PuzzleBattleEmotes } from "./PuzzleBattleEmotes";
import { PuzzleBattleResult } from "./PuzzleBattleResult";

interface PuzzleBattleProps {
  onReturnHome: () => void;
}

const DIFFICULTY_OPTIONS: { value: BattleDifficulty; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  {
    value: "online",
    label: "Online Multiplayer",
    icon: <Globe className="w-5 h-5" />,
    description: "Race against a real opponent",
    color: "border-cc-accent-blue/50 hover:border-cc-accent-blue shadow-[0_0_15px_rgba(91,164,207,0.15)]",
  },
  {
    value: "easy",
    label: "Novice Bot",
    icon: <Target className="w-5 h-5" />,
    description: "7–14s per puzzle",
    color: "border-cc-green/40 hover:border-cc-green",
  },
  {
    value: "medium",
    label: "Tactical Bot",
    icon: <Brain className="w-5 h-5" />,
    description: "3.5–7s per puzzle",
    color: "border-cc-accent-gold/40 hover:border-cc-accent-gold",
  },
  {
    value: "hard",
    label: "Master Bot",
    icon: <Zap className="w-5 h-5" />,
    description: "0.8–3s per puzzle",
    color: "border-cc-accent-red/40 hover:border-cc-accent-red",
  },
];

function MatchmakingLobby({
  onStart,
  onReturnHome,
}: {
  onStart: (difficulty: BattleDifficulty) => void;
  onReturnHome: () => void;
}) {
  const [selected, setSelected] = useState<BattleDifficulty>("online");
  const [searching, setSearching] = useState(false);

  const handleFind = () => {
    setSearching(true);
    // For bots, we artificially wait 2.2s. For online, the hook will handle real queueing.
    if (selected !== "online") {
      setTimeout(() => {
        onStart(selected);
      }, 2200);
    } else {
      onStart(selected);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 p-4 max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">⚔️</span>
          <h1 className="text-3xl font-black font-serif text-cc-text-primary tracking-tight">
            Puzzle Battle
          </h1>
        </div>
        <p className="text-cc-text-secondary text-sm max-w-xs leading-relaxed">
          Race an opponent to solve the same chess puzzle. First to find the winning move wins the round. Best of 5 wins the match.
        </p>
      </div>

      {!searching ? (
        <>
          <div className="w-full flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-cc-text-muted font-serif">
              Select Opponent
            </span>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                id={`battle-difficulty-${opt.value}`}
                onClick={() => setSelected(opt.value)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                  selected === opt.value
                    ? `${opt.color} bg-cc-bg-card relative overflow-hidden`
                    : "border-cc-border bg-cc-bg-card hover:bg-cc-bg-hover"
                }`}
              >
                {selected === opt.value && opt.value === "online" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cc-accent-blue/10 to-transparent pointer-events-none" />
                )}
                <span className={`${selected === opt.value ? "text-cc-accent-gold" : "text-cc-text-muted"} transition-colors ${selected === opt.value && opt.value === "online" ? "text-cc-accent-blue drop-shadow-[0_0_8px_rgba(91,164,207,0.5)]" : ""}`}>
                  {opt.icon}
                </span>
                <div className="flex flex-col z-10">
                  <span className={`font-bold ${selected === opt.value && opt.value === "online" ? "text-white" : "text-cc-text-primary"}`}>{opt.label}</span>
                  <span className={`text-[11px] ${selected === opt.value && opt.value === "online" ? "text-cc-accent-blue/80" : "text-cc-text-muted"}`}>{opt.description}</span>
                </div>
                {selected === opt.value && (
                  <span className={`ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full z-10 ${
                    opt.value === "online" 
                      ? "text-cc-accent-blue bg-cc-accent-blue/15" 
                      : "text-cc-accent-gold bg-cc-accent-gold/10"
                  }`}>
                    Selected
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              id="battle-find-match-btn"
              onClick={handleFind}
              className={`w-full py-4 rounded-xl text-white font-black text-base transition-all active:scale-95 shadow-xl cursor-pointer flex items-center justify-center gap-2 ${
                selected === "online" 
                  ? "bg-cc-accent-blue hover:bg-[#4a8eb5] shadow-[0_4px_15px_rgba(91,164,207,0.3)]" 
                  : "bg-cc-green hover:bg-cc-green-hover"
              }`}
            >
              <Wifi className="w-5 h-5" />
              {selected === "online" ? "Find Online Match" : "Start Bot Match"}
            </button>
            <button
              onClick={onReturnHome}
              className="w-full py-3 rounded-xl bg-cc-bg-card border border-cc-border text-cc-text-secondary hover:text-cc-text-primary font-bold text-sm transition-all active:scale-95 cursor-pointer"
            >
              Back
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-cc-border" />
            <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${selected === "online" ? "border-cc-accent-blue" : "border-cc-green"}`} />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">⚔️</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-bold text-cc-text-primary">
              {selected === "online" ? "Searching for opponent..." : "Loading bot..."}
            </span>
            <span className="text-xs text-cc-text-muted animate-pulse">
              {selected === "online" ? "Connecting to server" : "Preparing puzzles"}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full animate-bounce ${selected === "online" ? "bg-cc-accent-blue" : "bg-cc-green"}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          {selected === "online" && (
            <button
              onClick={() => {
                setSearching(false);
                // Return to menu (abort search handled by component unmount later if needed)
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-cc-bg-sidebar border border-cc-border text-xs font-bold text-cc-text-muted hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CountdownOverlay({ count }: { count: number }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-cc-bg-page/80 backdrop-blur-sm rounded-3xl">
      <div
        key={count}
        className="flex flex-col items-center gap-4 animate-[battle-countdown_0.6s_cubic-bezier(0.34,1.56,0.64,1)_both]"
      >
        {count > 0 ? (
          <>
            <span className="text-9xl font-black text-cc-green font-mono drop-shadow-[0_0_40px_rgba(129,182,76,0.8)]">
              {count}
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-cc-text-secondary">
              Get Ready...
            </span>
          </>
        ) : (
          <>
            <span className="text-6xl font-black text-cc-accent-gold font-serif drop-shadow-[0_0_40px_rgba(232,169,62,0.8)]">
              GO!
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-cc-text-secondary">
              Solve the puzzle!
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function PuzzleBattle({ onReturnHome }: PuzzleBattleProps) {
  const [difficulty, setDifficulty] = useState<BattleDifficulty | null>(null);

  const handleStart = useCallback((d: BattleDifficulty) => {
    setDifficulty(d);
  }, []);

  if (!difficulty) {
    return (
      <div className="w-full max-w-[1200px] mx-auto">
        <MatchmakingLobby onStart={handleStart} onReturnHome={onReturnHome} />
      </div>
    );
  }

  return <BattleArena difficulty={difficulty} onReturnHome={onReturnHome} onRematch={() => setDifficulty(null)} />;
}

function BattleArena({
  difficulty,
  onReturnHome,
  onRematch,
}: {
  difficulty: BattleDifficulty;
  onReturnHome: () => void;
  onRematch: () => void;
}) {
  const {
    phase,
    countdown,
    currentPuzzle,
    roundIndex,
    playerScore,
    opponentScore,
    roundOutcome,
    matchOutcome,
    roundHistory,
    roundTimeMs,
    emotes,
    playerFen,
    opponentFen,
    opponentLabel,
    opponentElo,
    totalRounds,
    handlePlayerMove,
    advanceRound,
    sendEmote,
    startMatch,
    error,
  } = usePuzzleBattle(difficulty);

  useEffect(() => {
    startMatch();
  }, [startMatch]);

  const isRoundResult = phase === "round-result";
  const isMatchResult = phase === "match-result";
  const showResult = isRoundResult || isMatchResult;

  const playerIsWinnerThisRound = isRoundResult && roundOutcome === "player";
  const playerIsLoserThisRound = isRoundResult && roundOutcome === "opponent";
  const opponentIsWinnerThisRound = isRoundResult && roundOutcome === "opponent";
  const opponentIsLoserThisRound = isRoundResult && roundOutcome === "player";

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 w-full text-center p-8 bg-cc-bg-card border border-cc-border rounded-3xl max-w-md mx-auto my-12 shadow-2xl animate-fade-in">
        <div className="text-5xl filter drop-shadow-[0_0_20px_rgba(232,169,62,0.4)]">🔒</div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-cc-text-primary">
            {error === "unauthorized" ? "Sign In to Play" : "Something went wrong"}
          </h2>
          <p className="text-sm text-cc-text-muted">
            {error === "unauthorized" 
              ? "You must be signed in to access Puzzle Battle and race against bots or other players." 
              : "An unexpected error occurred while loading the puzzles. Please try again later."}
          </p>
        </div>
        <div className="flex gap-4 w-full mt-2">
          <button
            onClick={onReturnHome}
            className="flex-1 px-4 py-3 rounded-xl border border-cc-border text-sm font-bold text-cc-text-muted hover:text-cc-text-primary hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            Go Home
          </button>
          {error === "unauthorized" ? (
            <a
              href="/login"
              className="flex-1 px-4 py-3 rounded-xl bg-cc-accent-gold text-cc-bg-page text-sm font-bold hover:bg-cc-accent-gold/90 transition-colors text-center cursor-pointer flex items-center justify-center"
            >
              Sign In
            </a>
          ) : (
            <button
              onClick={onRematch}
              className="flex-1 px-4 py-3 rounded-xl bg-cc-accent-blue text-white text-sm font-bold hover:opacity-90 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "matchmaking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 w-full">
         <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-cc-border" />
            <div className="absolute inset-0 rounded-full border-4 border-cc-accent-blue border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-2xl">⚔️</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-bold text-cc-text-primary">Searching for opponent...</span>
            <span className="text-xs text-cc-text-muted animate-pulse">Waiting in queue</span>
          </div>
          <button
              onClick={() => onRematch()}
              className="mt-4 px-5 py-2.5 rounded-lg bg-cc-bg-sidebar border border-cc-border font-bold text-cc-text-muted hover:text-white"
            >
              Cancel Search
          </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[1200px] mx-auto flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onReturnHome}
          className="flex items-center gap-2 text-cc-text-muted hover:text-cc-text-primary text-sm font-semibold transition-colors cursor-pointer"
          id="battle-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Battle
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cc-bg-card border border-cc-border rounded-full">
          <span className="text-[10px] uppercase tracking-widest font-bold text-cc-text-muted font-serif">
            Puzzle Battle
          </span>
          <span className="text-[10px] font-bold text-cc-accent-gold bg-cc-accent-gold/10 px-1.5 py-0.5 rounded-full">
            ⚔️ ARENA
          </span>
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row gap-4 items-start justify-center">
        {(phase === "countdown") && (
          <CountdownOverlay count={countdown} />
        )}

        {showResult && (
          <PuzzleBattleResult
            type={isMatchResult ? "match" : "round"}
            roundOutcome={roundOutcome}
            matchOutcome={matchOutcome}
            playerScore={playerScore}
            opponentScore={opponentScore}
            roundHistory={roundHistory}
            opponentLabel={opponentLabel}
            onNextRound={advanceRound}
            onRematch={onRematch}
            onReturnHome={onReturnHome}
          />
        )}

        <div className="flex-1 min-w-0">
          <PuzzleBattleBoard
            fen={playerFen}
            flipped={currentPuzzle?.fen.includes(" b ") ?? false}
            isOpponent={false}
            isWinner={playerIsWinnerThisRound}
            isLoser={playerIsLoserThisRound}
            onPieceDrop={handlePlayerMove}
            label="You"
            elo={1200}
            avatar="♟️"
          />
        </div>

        <div className="flex lg:flex-col items-center justify-center shrink-0 py-2">
          <PuzzleBattleHUD
            roundIndex={roundIndex}
            totalRounds={totalRounds}
            playerScore={playerScore}
            opponentScore={opponentScore}
            roundTimeMs={roundTimeMs}
            phase={phase}
          />
        </div>

        <div className="flex-1 min-w-0">
          <PuzzleBattleBoard
            fen={opponentFen}
            flipped={currentPuzzle?.fen.includes(" b ") ?? false}
            isOpponent={true}
            isWinner={opponentIsWinnerThisRound}
            isLoser={opponentIsLoserThisRound}
            label={opponentLabel}
            elo={opponentElo}
            avatar={difficulty === "online" ? "👤" : "🤖"}
          />
        </div>
      </div>

      <div className="bg-cc-bg-card border border-cc-border rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] uppercase tracking-widest font-bold text-cc-text-muted font-serif">
            Current Puzzle
          </span>
          {currentPuzzle ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-cc-text-primary">
                #{currentPuzzle.id.slice(0, 8)}
              </span>
              <span className="text-xs bg-cc-accent-gold/10 text-cc-accent-gold border border-cc-accent-gold/20 px-2 py-0.5 rounded-full font-bold">
                ★ {currentPuzzle.rating}
              </span>
              <div className="flex gap-1 flex-wrap max-w-[200px]">
                {currentPuzzle.themes.slice(0, 2).map((theme) => (
                  <span
                    key={theme}
                    className="text-[9px] text-cc-text-muted bg-cc-bg-sidebar px-1.5 py-0.5 rounded font-medium capitalize"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <span className="text-cc-text-muted text-xs italic">Loading...</span>
          )}
        </div>

        <PuzzleBattleEmotes emotes={emotes} onSendEmote={sendEmote} />
      </div>
    </div>
  );
}
