"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Puzzle } from "../../puzzles/api/puzzlesApi";

interface BattlePlayerInfo {
  id: string;
  name: string;
  rating: number;
  socketId: string;
}

interface MatchFoundData {
  roomId: string;
  puzzles: Puzzle[];
  players: Record<string, BattlePlayerInfo>;
}

export function usePuzzleBattleSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  
  const [roomId, setRoomId] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);
  
  const [opponentMove, setOpponentMove] = useState<{ source: string; target: string; fen: string } | null>(null);
  const [roundWinner, setRoundWinner] = useState<{ winnerSocketId: string; timeMs: number } | null>(null);
  const [opponentEmote, setOpponentEmote] = useState<string | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:4001/puzzle-battle", {
      autoConnect: true,
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));

    newSocket.on("matchFound", (data: MatchFoundData) => {
      setRoomId(data.roomId);
      setMatchData(data);
      setInQueue(false);
    });

    newSocket.on("opponentMove", (data: { source: string; target: string; fen: string }) => {
      setOpponentMove(data);
    });

    newSocket.on("roundWon", (data: { winnerSocketId: string; timeMs: number; playerScore: number }) => {
      setRoundWinner(data);
    });

    newSocket.on("opponentEmote", (data: { emoji: string }) => {
      setOpponentEmote(data.emoji);
    });

    newSocket.on("opponentDisconnected", () => {
      setOpponentDisconnected(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinQueue = useCallback(() => {
    if (socket) {
      socket.emit("joinQueue");
      setInQueue(true);
    }
  }, [socket]);

  const leaveQueue = useCallback(() => {
    if (socket) {
      socket.emit("leaveQueue");
      setInQueue(false);
    }
  }, [socket]);

  const sendMove = useCallback((source: string, target: string, fen: string) => {
    if (socket && roomId) {
      socket.emit("makeMove", { roomId, source, target, fen });
    }
  }, [socket, roomId]);

  const sendPuzzleSolved = useCallback((timeMs: number) => {
    if (socket && roomId) {
      socket.emit("puzzleSolved", { roomId, timeMs });
    }
  }, [socket, roomId]);

  const sendEmote = useCallback((emoji: string) => {
    if (socket && roomId) {
      socket.emit("sendEmote", { roomId, emoji });
    }
  }, [socket, roomId]);

  const clearOpponentMove = useCallback(() => setOpponentMove(null), []);
  const clearRoundWinner = useCallback(() => setRoundWinner(null), []);
  const clearOpponentEmote = useCallback(() => setOpponentEmote(null), []);

  return {
    socketId: socket?.id,
    connected,
    inQueue,
    roomId,
    matchData,
    opponentMove,
    roundWinner,
    opponentEmote,
    opponentDisconnected,
    joinQueue,
    leaveQueue,
    sendMove,
    sendPuzzleSolved,
    sendEmote,
    clearOpponentMove,
    clearRoundWinner,
    clearOpponentEmote,
  };
}
