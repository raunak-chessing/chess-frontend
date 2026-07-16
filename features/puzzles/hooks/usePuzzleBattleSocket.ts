"use client";

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Puzzle } from '../api/puzzlesApi';

interface BattlePlayer {
  id: string;
  socketId: string;
  score: number;
  strikes: number;
  rating: number;
  name: string;
}

interface MatchFoundPayload {
  roomId: string;
  puzzles: Puzzle[];
  players: Record<string, BattlePlayer>;
  startTime: number;
}

export function usePuzzleBattleSocket(userId: string, rating: number, name: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [inQueue, setInQueue] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [players, setPlayers] = useState<Record<string, BattlePlayer>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [endReason, setEndReason] = useState<string | null>(null);

  useEffect(() => {
    // Only connect when user intentionally joins queue
    if (!inQueue) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const newSocket = io(`${socketUrl}/puzzle-battle`);

    newSocket.on('connect', () => {
      newSocket.emit('joinQueue', { userId, rating, name });
    });

    newSocket.on('matchFound', (data: MatchFoundPayload) => {
      setRoomId(data.roomId);
      setPuzzles(data.puzzles);
      setPlayers(data.players);
      setStartTime(data.startTime);
      setInQueue(false);
    });

    newSocket.on('opponentScoreUpdate', (data: { userId: string, score: number, strikes: number }) => {
      setPlayers(prev => {
        if (!prev[data.userId]) return prev;
        return {
          ...prev,
          [data.userId]: {
            ...prev[data.userId],
            score: data.score,
            strikes: data.strikes
          }
        };
      });
    });

    newSocket.on('battleEnded', (data: { reason: string, players: Record<string, BattlePlayer> }) => {
      setIsBattleOver(true);
      setEndReason(data.reason);
      setPlayers(data.players);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [inQueue, userId, rating, name]);

  const joinQueue = useCallback(() => {
    setInQueue(true);
    setIsBattleOver(false);
    setRoomId(null);
    setPuzzles([]);
  }, []);

  const leaveQueue = useCallback(() => {
    setInQueue(false);
    if (socket) socket.disconnect();
  }, [socket]);

  const puzzleSolved = useCallback((puzzleId: string) => {
    if (socket && roomId) {
      socket.emit('puzzleSolved', { roomId, puzzleId });
    }
  }, [socket, roomId]);

  const puzzleFailed = useCallback((puzzleId: string) => {
    if (socket && roomId) {
      socket.emit('puzzleFailed', { roomId, puzzleId });
    }
  }, [socket, roomId]);

  return {
    inQueue,
    roomId,
    puzzles,
    players,
    startTime,
    isBattleOver,
    endReason,
    joinQueue,
    leaveQueue,
    puzzleSolved,
    puzzleFailed,
  };
}
