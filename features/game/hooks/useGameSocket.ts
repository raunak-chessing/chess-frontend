"use client";

import { useState, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket-client";
import type { GameActions } from "./useGameState";

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
  connected: boolean;
  setRoomCode: (code: string) => void;
  setUserRating: (rating: number) => void;
  handleJoinOnlineRoom: () => void;
  handleJoinQueue: () => void;
  handleLeaveQueue: () => void;
}

export function useGameSocket(handlers: SocketEventHandlers): UseGameSocketReturn {
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [userRating, setUserRating] = useState<number>(1200);

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
    };

    const onGameStart = () => {
      handlers.resetGame();
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
  }, [socket, handlers]);

  const handleJoinOnlineRoom = useCallback(() => {
    if (socket && roomCode.trim() !== "") {
      socket.emit("joinRoom", { room: roomCode.trim() });
    }
  }, [socket, roomCode]);

  const handleJoinQueue = useCallback(() => {
    if (socket) {
      socket.emit("joinQueue", { rating: Number(userRating) });
    }
  }, [socket, userRating]);

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
    userRating,
    connected,
    setRoomCode,
    setUserRating,
    handleJoinOnlineRoom,
    handleJoinQueue,
    handleLeaveQueue,
  };
}
