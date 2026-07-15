"use client";

import { useState, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket-client";
import type { GameActions } from "./useGameState";
import { authClient } from "@/lib/auth-client";

interface SocketEventHandlers {
  applyMove: GameActions["applyMove"];
  applyUndo: GameActions["applyUndo"];
  resetGame: GameActions["resetGame"];
  onOpponentDisconnected: () => void;
  onOpponentResigned: () => void;
}

interface UseGameSocketReturn {
  socket: Socket;
  playerColor: "w" | "b" | null;
  joinedRoom: string;
  inQueue: boolean;
  roomCode: string;
  userRating: number;
  timeControl: string;
  setTimeControl: (tc: string) => void;
  connected: boolean;
  selfPlayer: { name: string; rating: number } | null;
  opponent: { name: string; rating: number } | null;
  setRoomCode: (code: string) => void;
  handleJoinOnlineRoom: () => void;
  handleJoinQueue: () => void;
  handleLeaveQueue: () => void;
}

export function useGameSocket(handlers: SocketEventHandlers): UseGameSocketReturn {
  const { data: session } = authClient.useSession();
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [timeControl, setTimeControl] = useState<string>("10|0");

  const getRatingForTimeControl = useCallback((tc: string): number => {
    if (!session?.user) return 1200;
    const tcLower = tc.toLowerCase();
    if (tcLower.includes("day")) {
      return (session.user as any).ratingDaily ?? 1200;
    }
    const parts = tc.split(/[|+]/);
    if (parts.length === 0) return (session.user as any).ratingRapid ?? 1200;
    const base = parseFloat(parts[0]);
    if (isNaN(base)) return (session.user as any).ratingRapid ?? 1200;
    const inc = parts.length > 1 ? parseFloat(parts[1]) : 0;
    const total = base * 60 + 40 * (isNaN(inc) ? 0 : inc);

    if (total < 180) {
      return (session.user as any).ratingBullet ?? 1200;
    } else if (total < 600) {
      return (session.user as any).ratingBlitz ?? 1200;
    } else {
      return (session.user as any).ratingRapid ?? 1200;
    }
  }, [session]);

  const currentRating = getRatingForTimeControl(timeControl);
  const [selfPlayer, setSelfPlayer] = useState<{ name: string; rating: number } | null>(null);
  const [opponent, setOpponent] = useState<{ name: string; rating: number } | null>(null);

  const socket = getSocket();
  const [connected, setConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    const onRoomJoined = (data: { color: "w" | "b"; room: string }) => {
      setPlayerColor(data.color);
      setJoinedRoom(data.room);
      setInQueue(false);
      setSelfPlayer(null);
      setOpponent(null);
    };

    const onGameStart = (data: {
      white: { id: string; name: string; rating: number };
      black: { id: string; name: string; rating: number };
    }) => {
      handlers.resetGame();
      if (data?.white && data?.black) {
        setSelfPlayer(playerColor === "b" ? data.black : data.white);
        setOpponent(playerColor === "b" ? data.white : data.black);
      }
    };

    const onOpponentMove = (data: { from: string; to: string; fen: string }) => {
      handlers.applyMove(data.from, data.to);
    };

    const onOpponentUndo = () => {
      handlers.applyUndo();
    };

    const onGameReset = () => {
      handlers.resetGame();
    };

    const onOpponentDisconnected = () => {
      handlers.onOpponentDisconnected();
    };

    const onOpponentResigned = () => {
      handlers.onOpponentResigned();
    };

    const onQueueJoined = () => {
      setInQueue(true);
    };

    const onQueueLeft = () => {
      setInQueue(false);
    };

    socket.on("roomJoined", onRoomJoined);
    socket.on("gameStart", onGameStart);
    socket.on("opponentMove", onOpponentMove);
    socket.on("opponentUndo", onOpponentUndo);
    socket.on("gameReset", onGameReset);
    socket.on("opponentDisconnected", onOpponentDisconnected);
    socket.on("opponentResigned", onOpponentResigned);
    socket.on("queueJoined", onQueueJoined);
    socket.on("queueLeft", onQueueLeft);

    return () => {
      socket.off("roomJoined", onRoomJoined);
      socket.off("gameStart", onGameStart);
      socket.off("opponentMove", onOpponentMove);
      socket.off("opponentUndo", onOpponentUndo);
      socket.off("gameReset", onGameReset);
      socket.off("opponentDisconnected", onOpponentDisconnected);
      socket.off("opponentResigned", onOpponentResigned);
      socket.off("queueJoined", onQueueJoined);
      socket.off("queueLeft", onQueueLeft);
    };
  }, [socket, handlers, playerColor]);

  const handleJoinOnlineRoom = useCallback(() => {
    if (socket && roomCode.trim() !== "") {
      socket.emit("joinRoom", { room: roomCode.trim() });
    }
  }, [socket, roomCode]);

  const handleJoinQueue = useCallback(() => {
    if (socket) {
      socket.emit("joinQueue", { timeControl });
    }
  }, [socket, timeControl]);

  const handleLeaveQueue = useCallback(() => {
    if (socket) {
      socket.emit("leaveQueue");
    }
  }, [socket]);

  return {
    socket,
    playerColor,
    joinedRoom,
    inQueue,
    roomCode,
    userRating: currentRating,
    timeControl,
    setTimeControl,
    connected,
    selfPlayer,
    opponent,
    setRoomCode,
    handleJoinOnlineRoom,
    handleJoinQueue,
    handleLeaveQueue,
  };
}
