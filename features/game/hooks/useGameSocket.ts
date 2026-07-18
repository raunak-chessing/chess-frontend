"use client";

import { useState, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import { getSocket, connectSocket } from "@/lib/socket-client";
import type { GameActions } from "./useGameState";
import { authClient } from "@/lib/auth-client";
import type { ChessUser } from "@/types/auth.types";

interface SocketEventHandlers {
  applyMove: (from: string, to?: string, promotion?: string) => boolean;
  applyUndo: GameActions["applyUndo"];
  performUndo: GameActions["performUndo"];
  resetGame: GameActions["resetGame"];
  onOpponentDisconnected: () => void;
  onOpponentResigned: () => void;
  onTimeout: (color: "w" | "b") => void;
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
  handleClaimTimeout: () => void;
  serverWhiteMs: number;
  serverBlackMs: number;
  serverSyncTimestamp: number;
  consentRequest: "undo" | "rematch" | null;
  consentPending: "undo" | "rematch" | null;
  requestUndo: () => void;
  acceptUndo: () => void;
  declineUndo: () => void;
  cancelUndoRequest: () => void;
  requestRematch: () => void;
  acceptRematch: () => void;
  declineRematch: () => void;
  cancelRematchRequest: () => void;
}

export function useGameSocket(handlers: SocketEventHandlers): UseGameSocketReturn {
  const { data: session } = authClient.useSession();
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [timeControl, setTimeControl] = useState<string>("10|0");

  const [consentRequest, setConsentRequest] = useState<"undo" | "rematch" | null>(null);
  const [consentPending, setConsentPending] = useState<"undo" | "rematch" | null>(null);

  const [serverWhiteMs, setServerWhiteMs] = useState(600000);
  const [serverBlackMs, setServerBlackMs] = useState(600000);
  const [serverSyncTimestamp, setServerSyncTimestamp] = useState(0);

  const getRatingForTimeControl = useCallback((tc: string): number => {
    if (!session?.user) return 1200;
    const user = session.user as ChessUser;
    const tcLower = tc.toLowerCase();
    if (tcLower.includes("day")) {
      return user.ratingDaily ?? 1200;
    }
    const parts = tc.split(/[|+]/);
    if (parts.length === 0) return user.ratingRapid ?? 1200;
    const base = parseFloat(parts[0]);
    if (isNaN(base)) return user.ratingRapid ?? 1200;
    const inc = parts.length > 1 ? parseFloat(parts[1]) : 0;
    const total = base * 60 + 40 * (isNaN(inc) ? 0 : inc);

    if (total < 180) {
      return user.ratingBullet ?? 1200;
    } else if (total < 600) {
      return user.ratingBlitz ?? 1200;
    } else {
      return user.ratingRapid ?? 1200;
    }
  }, [session]);

  const currentRating = getRatingForTimeControl(timeControl);
  const [selfPlayer, setSelfPlayer] = useState<{ name: string; rating: number } | null>(null);
  const [opponent, setOpponent] = useState<{ name: string; rating: number } | null>(null);

  const socket = connectSocket();
  const [connected, setConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      if (joinedRoom && socket) {
        socket.emit("rejoinRoom", { room: joinedRoom });
      }
    };
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket, joinedRoom]);

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
      whiteTimeLeftMs: number;
      blackTimeLeftMs: number;
    }) => {
      handlers.resetGame();
      if (data?.white && data?.black) {
        setSelfPlayer(playerColor === "b" ? data.black : data.white);
        setOpponent(playerColor === "b" ? data.white : data.black);
      }
      if (data?.whiteTimeLeftMs !== undefined) {
        setServerWhiteMs(data.whiteTimeLeftMs);
        setServerBlackMs(data.blackTimeLeftMs);
        setServerSyncTimestamp(Date.now());
      }
    };

    const onOpponentMove = (data: { from: string; to: string; promotion?: string; fen: string; whiteTimeLeftMs: number; blackTimeLeftMs: number }) => {
      handlers.applyMove(data.from, data.to, data.promotion);
      setServerWhiteMs(data.whiteTimeLeftMs);
      setServerBlackMs(data.blackTimeLeftMs);
      setServerSyncTimestamp(Date.now());
    };

    const onOpponentUndo = () => {
      handlers.applyUndo();
    };

    const onGameReset = () => {
      handlers.resetGame();
    };

    const onUndoRequested = () => setConsentRequest("undo");
    const onUndoAccepted = () => {
      setConsentPending(null);
      const { undone, prevFrom, prevTo, fen } = handlers.performUndo();
      if (undone) {
        socket.emit("executeUndo", {
          room: joinedRoom,
          fen,
          from: prevFrom,
          to: prevTo,
        });
      }
    };
    const onUndoDeclined = () => setConsentPending(null);

    const onRematchRequested = () => setConsentRequest("rematch");
    const onRematchAccepted = () => {
      setConsentPending(null);
      setConsentRequest(null);
      handlers.resetGame();
    };
    const onRematchDeclined = () => setConsentPending(null);

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

    const onTimeout = (data: { winner: string }) => {
      const timeoutColor = data.winner === "BLACK" ? "w" : "b";
      handlers.onTimeout(timeoutColor);
    };

    socket.on("roomJoined", onRoomJoined);
    socket.on("gameStart", onGameStart);
    socket.on("opponentMove", onOpponentMove);
    socket.on("opponentUndo", onOpponentUndo);
    socket.on("opponentReset", onOpponentReset);
    socket.on("opponentDisconnected", handlers.onOpponentDisconnected);
    socket.on("opponentResigned", handlers.onOpponentResigned);
    socket.on("gameTimeout", onTimeout);
    socket.on("undoRequested", onUndoRequested);
    socket.on("undoAccepted", onUndoAccepted);
    socket.on("undoDeclined", onUndoDeclined);
    socket.on("rematchRequested", onRematchRequested);
    socket.on("rematchAccepted", onRematchAccepted);
    socket.on("rematchDeclined", onRematchDeclined);
    socket.on("queueJoined", onQueueJoined);
    socket.on("queueLeft", onQueueLeft);

    return () => {
      socket.off("roomJoined", onRoomJoined);
      socket.off("gameStart", onGameStart);
      socket.off("opponentMove", onOpponentMove);
      socket.off("opponentUndo", onOpponentUndo);
      socket.off("opponentReset", onOpponentReset);
      socket.off("opponentDisconnected", handlers.onOpponentDisconnected);
      socket.off("opponentResigned", handlers.onOpponentResigned);
      socket.off("gameTimeout", onTimeout);
      socket.off("undoRequested", onUndoRequested);
      socket.off("undoAccepted", onUndoAccepted);
      socket.off("undoDeclined", onUndoDeclined);
      socket.off("rematchRequested", onRematchRequested);
      socket.off("rematchAccepted", onRematchAccepted);
      socket.off("rematchDeclined", onRematchDeclined);
      socket.off("queueJoined", onQueueJoined);
      socket.off("queueLeft", onQueueLeft);
    };
  }, [socket, playerColor, handlers]);

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

  const handleClaimTimeout = useCallback(() => {
    if (socket && joinedRoom) {
      socket.emit("claimTimeout", { room: joinedRoom });
    }
  }, [socket, joinedRoom]);

  const requestUndo = useCallback(() => {
    socket.emit("requestUndo", { room: joinedRoom });
    setConsentPending("undo");
  }, [socket, joinedRoom]);

  const acceptUndo = useCallback(() => {
    socket.emit("acceptUndo", { room: joinedRoom });
    setConsentRequest(null);
    handlers.applyUndo();
  }, [socket, joinedRoom, handlers]);

  const declineUndo = useCallback(() => {
    socket.emit("declineUndo", { room: joinedRoom });
    setConsentRequest(null);
  }, [socket, joinedRoom]);

  const cancelUndoRequest = useCallback(() => {
    setConsentPending(null);
  }, []);

  const requestRematch = useCallback(() => {
    socket.emit("requestRematch", { room: joinedRoom });
    setConsentPending("rematch");
  }, [socket, joinedRoom]);

  const acceptRematch = useCallback(() => {
    socket.emit("acceptRematch", { room: joinedRoom });
    setConsentRequest(null);
    // When accepting rematch, the backend broadcasts rematchAccepted and both clients reset the game state.
  }, [socket, joinedRoom]);

  const declineRematch = useCallback(() => {
    socket.emit("declineRematch", { room: joinedRoom });
    setConsentRequest(null);
  }, [socket, joinedRoom]);

  const cancelRematchRequest = useCallback(() => {
    setConsentPending(null);
  }, []);

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
    handleClaimTimeout,
    serverWhiteMs,
    serverBlackMs,
    serverSyncTimestamp,
    consentRequest,
    consentPending,
    requestUndo,
    acceptUndo,
    declineUndo,
    cancelUndoRequest,
    requestRematch,
    acceptRematch,
    declineRematch,
    cancelRematchRequest,
  };
}
