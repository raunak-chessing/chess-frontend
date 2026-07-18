import { useState, useEffect, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import type { Puzzle } from "../../puzzles/api/puzzlesApi";
import { puzzlesApi } from "../../puzzles/api/puzzlesApi";
import { playSound } from "../../../lib/utils";
import { usePuzzleBattleSocket } from "./usePuzzleBattleSocket";

export type BattleDifficulty = "easy" | "medium" | "hard" | "online";
export type RoundOutcome = "player" | "opponent" | null;
export type MatchOutcome = "player" | "opponent" | null;
export type BattlePhase =
  | "matchmaking"
  | "countdown"
  | "playing"
  | "round-result"
  | "match-result"
  | "error";

export interface Emote {
  id: string;
  emoji: string;
  fromOpponent: boolean;
  timestamp: number;
}

export interface RoundRecord {
  winner: "player" | "opponent";
  playerTimeMs: number;
  opponentTimeMs: number;
}

const DIFFICULTY_CONFIG: Record<
  Exclude<BattleDifficulty, "online">,
  { minMs: number; maxMs: number; label: string; elo: number }
> = {
  easy: { minMs: 7000, maxMs: 14000, label: "Novice Bot", elo: 800 },
  medium: { minMs: 3500, maxMs: 7000, label: "Tactical Bot", elo: 1400 },
  hard: { minMs: 800, maxMs: 3000, label: "Master Bot", elo: 2100 },
};

const TOTAL_ROUNDS = 5;

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function usePuzzleBattle(difficulty: BattleDifficulty) {
  const [phase, setPhase] = useState<BattlePhase>("matchmaking");
  const [countdown, setCountdown] = useState(3);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [roundOutcome, setRoundOutcome] = useState<RoundOutcome>(null);
  const [matchOutcome, setMatchOutcome] = useState<MatchOutcome>(null);
  const [roundHistory, setRoundHistory] = useState<RoundRecord[]>([]);
  const [roundTimeMs, setRoundTimeMs] = useState(0);
  const [emotes, setEmotes] = useState<Emote[]>([]);
  const [error, setError] = useState<"unauthorized" | "unknown" | null>(null);

  const [playerChess, setPlayerChess] = useState<Chess>(new Chess());
  const [playerFen, setPlayerFen] = useState("start");
  const [playerMoveIdx, setPlayerMoveIdx] = useState(0);
  const [opponentFen, setOpponentFen] = useState("start");
  
  const [opponentLabel, setOpponentLabel] = useState("");
  const [opponentElo, setOpponentElo] = useState(1200);

  const roundStartTime = useRef<number>(0);
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOnline = difficulty === "online";
  const config = isOnline ? null : DIFFICULTY_CONFIG[difficulty];
  const currentPuzzle = puzzles[roundIndex] ?? null;

  const {
    socketId,
    joinQueue,
    leaveQueue,
    sendMove,
    sendPuzzleSolved,
    sendEmote: sendSocketEmote,
    matchData,
    opponentMove,
    roundWinner,
    opponentEmote,
    opponentDisconnected,
    battleEnded,
    clearOpponentMove,
    clearRoundWinner,
    clearOpponentEmote,
  } = usePuzzleBattleSocket();

  const triggerOpponentEmote = useCallback((emoji: string) => {
    const emote: Emote = {
      id: `opp-${Date.now()}-${Math.random()}`,
      emoji,
      fromOpponent: true,
      timestamp: Date.now(),
    };
    setEmotes((prev) => [...prev, emote]);
    setTimeout(() => {
      setEmotes((prev) => prev.filter((e) => e.id !== emote.id));
    }, 3500);
  }, []);

  const clearTimers = useCallback(() => {
    if (opponentTimerRef.current) {
      clearTimeout(opponentTimerRef.current);
      opponentTimerRef.current = null;
    }
    if (roundTimerRef.current) {
      clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }
  }, []);

  const loadRound = useCallback(
    (puzzle: Puzzle) => {
      const chess = new Chess(puzzle.fen);
      setPlayerChess(chess);
      setPlayerFen(puzzle.fen);
      setOpponentFen(puzzle.fen);
      setPlayerMoveIdx(0);
      setRoundOutcome(null);
      roundStartTime.current = Date.now();
      setRoundTimeMs(0);
    },
    []
  );

  const resolveRound = useCallback(
    (winner: "player" | "opponent", playerMs: number, opponentMs: number) => {
      clearTimers();

      const record: RoundRecord = {
        winner,
        playerTimeMs: playerMs,
        opponentTimeMs: opponentMs,
      };

      setRoundHistory((prev) => [...prev, record]);
      setRoundOutcome(winner);

      if (winner === "player") {
        playSound("/sounds/capture.mp3");
        setPlayerScore((s) => s + 1);
      } else {
        playSound("/sounds/check.mp3");
        setOpponentScore((s) => s + 1);
      }

      setPhase("round-result");
    },
    [clearTimers]
  );

  // Online Match Found Effect
  useEffect(() => {
    if (isOnline && phase === "matchmaking" && matchData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPuzzles(matchData.puzzles);
      // Find opponent
      const oppKey = Object.keys(matchData.players).find(key => key !== socketId);
      if (oppKey) {
        const opp = matchData.players[oppKey];
         
        setOpponentLabel(opp.name);
         
        setOpponentElo(opp.rating);
      } else {
         
        setOpponentLabel("Opponent");
      }
      
       
      setPhase("countdown");
       
      setCountdown(3);
       
      setPlayerScore(0);
       
      setOpponentScore(0);
       
      setRoundIndex(0);
       
      setRoundHistory([]);
       
      setMatchOutcome(null);

      let c = 3;
      const interval = setInterval(() => {
        c -= 1;
         
        setCountdown(c);
        if (c <= 0) {
          clearInterval(interval);
           
          setPhase("playing");
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOnline, phase, matchData, socketId]);

  // Online Opponent Move Effect
  useEffect(() => {
    if (isOnline && phase === "playing" && opponentMove) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpponentFen(opponentMove.fen);
      clearOpponentMove();
    }
  }, [isOnline, phase, opponentMove, clearOpponentMove]);

  // Online Round Winner Effect
  useEffect(() => {
    if (isOnline && phase === "playing" && roundWinner) {
      const isPlayerWinner = roundWinner.winnerSocketId === socketId;
      const elapsed = Date.now() - roundStartTime.current;
      if (isPlayerWinner) {
        resolveRound("player", roundWinner.timeMs, elapsed + 1000);
      } else {
        resolveRound("opponent", elapsed + 1000, roundWinner.timeMs);
      }
      clearRoundWinner();
    }
  }, [isOnline, phase, roundWinner, socketId, resolveRound, clearRoundWinner]);

  // Online Opponent Emote Effect
  useEffect(() => {
    if (isOnline && opponentEmote) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      triggerOpponentEmote(opponentEmote);
      clearOpponentEmote();
    }
  }, [isOnline, opponentEmote, clearOpponentEmote, triggerOpponentEmote]);

  // Online Disconnect Effect
  useEffect(() => {
    if (isOnline && opponentDisconnected && phase !== "match-result") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatchOutcome("player");
       
      setPhase("match-result");
    }
  }, [isOnline, opponentDisconnected, phase]);

  // Online Battle Ended Effect
  useEffect(() => {
    if (isOnline && battleEnded && phase !== "match-result") {
      let isPlayerWinner = false;
      if (matchData && socketId && matchData.players[socketId]) {
         isPlayerWinner = matchData.players[socketId].id === battleEnded.winnerId;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMatchOutcome(isPlayerWinner ? "player" : "opponent");
       
      setPhase("match-result");
    }
  }, [isOnline, battleEnded, phase, matchData, socketId]);

  const scheduleOpponent = useCallback(
    (puzzle: Puzzle) => {
      if (isOnline || !config) return;
      const totalDelay = randomDelay(config.minMs, config.maxMs);
      const moveCount = puzzle.moves.length;
      const delayPerMove = totalDelay / moveCount;

      let currentMoveIndex = 0;
      const chess = new Chess(puzzle.fen);

      const playNextMove = () => {
        if (phase !== "playing") return;

        const m = puzzle.moves[currentMoveIndex];
        const from = m.slice(0, 2);
        const to = m.slice(2, 4);
        const promotion = m.length > 4 ? m[4] : undefined;
        
        chess.move({ from, to, promotion });
        setOpponentFen(chess.fen());
        currentMoveIndex++;

        if (currentMoveIndex < moveCount) {
          opponentTimerRef.current = setTimeout(playNextMove, delayPerMove);
        } else {
          const elapsed = Date.now() - roundStartTime.current;
          setTimeout(() => {
            resolveRound("opponent", elapsed + 5000, elapsed);
          }, 600);
        }
      };

      opponentTimerRef.current = setTimeout(playNextMove, delayPerMove);
    },
    [config, phase, resolveRound, isOnline]
  );

  const startRoundTimer = useCallback(() => {
    roundTimerRef.current = setInterval(() => {
      setRoundTimeMs(Date.now() - roundStartTime.current);
    }, 100);
  }, []);

  const startMatch = useCallback(async () => {
    if (isOnline) {
      setPhase("matchmaking");
      joinQueue();
      return;
    }

    setPhase("countdown");
    setCountdown(3);
    setPlayerScore(0);
    setOpponentScore(0);
    setRoundIndex(0);
    setRoundHistory([]);
    setMatchOutcome(null);
    setError(null);

    try {
      const batch = await puzzlesApi.getRushBatch(TOTAL_ROUNDS + 2);
      setPuzzles(batch);
      if (config) {
        setOpponentLabel(config.label);
        setOpponentElo(config.elo);
      }

      let c = 3;
      const interval = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(interval);
          setPhase("playing");
        }
      }, 1000);
    } catch (err: unknown) {
      let is401 = false;
      if (err && typeof err === "object" && "status" in err) {
        if ((err as { status: unknown }).status === 401) {
          is401 = true;
        }
      }
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response: unknown }).response;
        if (response && typeof response === "object" && "data" in response) {
          const data = (response as { data: unknown }).data;
          if (data && typeof data === "object" && "statusCode" in data) {
            if ((data as { statusCode: unknown }).statusCode === 401) {
              is401 = true;
            }
          }
        }
      }

      if (is401) {
        setError("unauthorized");
      } else {
        setError("unknown");
      }
      setPhase("error");
    }
  }, [isOnline, joinQueue, config]);

  useEffect(() => {
    if (phase === "playing" && currentPuzzle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRound(currentPuzzle);
       
      scheduleOpponent(currentPuzzle);
       
      startRoundTimer();
    }
    return clearTimers;
  }, [phase, roundIndex, currentPuzzle, loadRound, scheduleOpponent, startRoundTimer, clearTimers]);

  useEffect(() => {
    return () => {
      if (isOnline) leaveQueue();
    };
  }, [isOnline, leaveQueue]);

  const advanceRound = useCallback(() => {
    const nextRound = roundIndex + 1;
    const playerWins = roundHistory.filter((r) => r.winner === "player").length + (roundOutcome === "player" ? 1 : 0);
    const opponentWins = roundHistory.filter((r) => r.winner === "opponent").length + (roundOutcome === "opponent" ? 1 : 0);

    const winsNeeded = Math.ceil(TOTAL_ROUNDS / 2) + 1;
    const isMatchOver =
      nextRound >= TOTAL_ROUNDS ||
      playerWins >= winsNeeded ||
      opponentWins >= winsNeeded;

    if (isMatchOver) {
      const finalPlayerWins = playerWins;
      const finalOpponentWins = opponentWins;
      setMatchOutcome(finalPlayerWins >= finalOpponentWins ? "player" : "opponent");
      setPhase("match-result");
    } else {
      setRoundIndex(nextRound);
      setPhase("playing");
    }
  }, [roundIndex, roundOutcome, roundHistory]);

  const handlePlayerMove = useCallback(
    (source: string, target: string): boolean => {
      if (phase !== "playing" || !currentPuzzle || roundOutcome !== null) {
        return false;
      }

      const expectedMove = currentPuzzle.moves[playerMoveIdx];
      const expectedFromTo = expectedMove.slice(0, 4);
      const expectedPromotion = expectedMove.length > 4 ? expectedMove[4] : undefined;
      const moveStr = `${source}${target}`;

      if (moveStr !== expectedFromTo) {
        playSound("/sounds/check.mp3");
        const chess = new Chess(currentPuzzle.fen);
        for (let i = 0; i < playerMoveIdx; i++) {
          const m = currentPuzzle.moves[i];
          const promotion = m.length > 4 ? m[4] : undefined;
          chess.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion });
        }
        setPlayerChess(chess);
        setPlayerFen(chess.fen());
        setPlayerMoveIdx(0);
        return false;
      }

      try {
        const move = playerChess.move({ from: source, to: target, promotion: expectedPromotion });
        if (!move) return false;

        const nextFen = playerChess.fen();
        setPlayerFen(nextFen);
        playSound("/sounds/move.mp3");
        
        if (isOnline) {
          sendMove(source, target, nextFen);
        }

        const nextIdx = playerMoveIdx + 1;

        if (nextIdx >= currentPuzzle.moves.length) {
          const elapsed = Date.now() - roundStartTime.current;
          if (isOnline) {
            sendPuzzleSolved(elapsed, roundIndex);
          } else {
            resolveRound("player", elapsed, (config?.maxMs ?? 5000) + 1000);
          }
          return true;
        }

        setPlayerMoveIdx(nextIdx);
        return true;
      } catch {
        return false;
      }
    },
    [phase, currentPuzzle, playerMoveIdx, playerChess, roundOutcome, isOnline, sendMove, sendPuzzleSolved, resolveRound, config, roundIndex]
  );

  const sendEmote = useCallback((emoji: string) => {
    const emote: Emote = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      fromOpponent: false,
      timestamp: Date.now(),
    };
    setEmotes((prev) => [...prev, emote]);
    if (isOnline) {
      sendSocketEmote(emoji);
    }
    setTimeout(() => {
      setEmotes((prev) => prev.filter((e) => e.id !== emote.id));
    }, 3500);
  }, [isOnline, sendSocketEmote]);



  const isPlayerTurn = currentPuzzle
    ? playerMoveIdx % 2 === 0
      ? !currentPuzzle.fen.includes(" b ")
      : currentPuzzle.fen.includes(" b ")
    : false;

  return {
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
    totalRounds: TOTAL_ROUNDS,
    isPlayerTurn,
    error,
    startMatch,
    handlePlayerMove,
    advanceRound,
    sendEmote,
    triggerOpponentEmote,
  };
}
