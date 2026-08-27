"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getSocket, connectSocket } from "@/lib/socket-client";
type Socket = ReturnType<typeof getSocket>;
import type { GameActions } from "./useGameState";
import { authClient } from "@/lib/auth-client";
import type { ChessUser } from "@/types/auth.types";
import { classifyTimeControl } from "@/lib/timeControl";
import type { GameVariant } from "../types/game.types";

interface SocketEventHandlers {
  applyUndo: GameActions["applyUndo"];
  resetGame: GameActions["resetGame"];
  syncGameState?: (pgn: string, options?: { announceMove?: boolean }) => void;
  setVariant?: GameActions["setVariant"];
  onOpponentDisconnected: () => void;
  onOpponentResigned: () => void;
  onTimeout: (winner: "w" | "b") => void;
  onRematchAccepted?: (newGameId?: string) => void;
}

export interface UseGameSocketReturn {
  socket: Socket;
  playerColor: "w" | "b" | "s" | null;
  joinedRoom: string;
  inQueue: boolean;
  roomCode: string;
  userRating: number;
  timeControl: string;
  setTimeControl: (tc: string) => void;
  variant: GameVariant;
  setVariant: (variant: GameVariant) => void;
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
  consentRequest: "undo" | "rematch" | "draw" | null;
  consentPending: "undo" | "rematch" | "draw" | null;
  requestUndo: () => void;
  acceptUndo: () => void;
  requestAbort: () => void;
  declineUndo: () => void;
  cancelUndoRequest: () => void;
  requestRematch: () => void;
  acceptRematch: () => void;
  declineRematch: () => void;
  cancelRematchRequest: () => void;
  requestDraw: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  cancelDrawRequest: () => void;
}

export function useGameSocket(handlers: SocketEventHandlers): UseGameSocketReturn {
  const { data: session } = authClient.useSession();
  const [playerColor, setPlayerColor] = useState<"w" | "b" | "s" | null>(null);
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const [inQueue, setInQueue] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>("");
  const [timeControl, setTimeControl] = useState<string>("10|0");
  const [variant, setVariant] = useState<GameVariant>("standard");

  const [consentRequest, setConsentRequest] = useState<"undo" | "rematch" | "draw" | null>(null);
  const [consentPending, setConsentPending] = useState<"undo" | "rematch" | "draw" | null>(null);

  const [serverWhiteMs, setServerWhiteMs] = useState(600000);
  const [serverBlackMs, setServerBlackMs] = useState(600000);
  const [serverSyncTimestamp, setServerSyncTimestamp] = useState(0);

  const getRatingForTimeControl = useCallback((tc: string): number => {
    if (!session?.user) return 1200;
    const user = session.user as unknown as ChessUser;

    switch (classifyTimeControl(tc)) {
      case "Daily":
        return user.ratingDaily ?? 1200;
      case "Bullet":
        return user.ratingBullet ?? 1200;
      case "Blitz":
        return user.ratingBlitz ?? 1200;
      case "Rapid":
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
        socket.emit("join_game", { room: joinedRoom });
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
    const onRoomJoined = (data: { gameId: string; whitePlayerId?: string; blackPlayerId?: string }) => {
      const myId = session?.user?.id;
      let color: "w" | "b" | "s" | null = null;
      if (myId && data.whitePlayerId && data.blackPlayerId) {
        color = data.whitePlayerId === myId ? "w" : data.blackPlayerId === myId ? "b" : "s";
      }
      setPlayerColor(color);
      setJoinedRoom(data.gameId);
      setInQueue(false);
      setSelfPlayer(null);
      setOpponent(null);
      if (socket && data.gameId) {
        socket.emit("join_game", { room: data.gameId });
      }
    };

    const onGameStart = (data: any) => {
      handlers.resetGame();
      
      let determinedColor: "w" | "b" | "s" | null = playerColor;
      const myId = session?.user?.id;
      
      if (myId && data.whitePlayerId && data.blackPlayerId) {
        if (data.whitePlayerId === myId) {
          determinedColor = "w";
        } else if (data.blackPlayerId === myId) {
          determinedColor = "b";
        } else {
          determinedColor = "s";
        }
        setPlayerColor(determinedColor);
      }

      if (data?.white && data?.black) {
        setSelfPlayer(determinedColor === "b" ? data.black : data.white);
        setOpponent(determinedColor === "b" ? data.white : data.black);
      }
      
      if (data?.serverWhiteMs !== undefined) {
        setServerWhiteMs(data.serverWhiteMs);
        setServerBlackMs(data.serverBlackMs);
        setServerSyncTimestamp(data.serverSyncTimestamp || Date.now());
      } else if (data?.whiteTimeLeftMs !== undefined) {
        setServerWhiteMs(data.whiteTimeLeftMs);
        setServerBlackMs(data.blackTimeLeftMs);
        setServerSyncTimestamp(Date.now());
      }

      if (data?.variant && handlers.setVariant) {
        handlers.setVariant(data.variant as GameVariant);
      }

      if (data?.pgn && handlers.syncGameState) {
        handlers.syncGameState(data.pgn);
      }
    };

    const onOpponentMove = (data: { pgn: string; fen: string; whiteTimeLeftMs?: number; blackTimeLeftMs?: number; serverWhiteMs?: number; serverBlackMs?: number; serverSyncTimestamp?: number }) => {
      if (data.pgn && handlers.syncGameState) {
        handlers.syncGameState(data.pgn, { announceMove: true });
      }
      if (data.serverWhiteMs !== undefined) {
        setServerWhiteMs(data.serverWhiteMs);
        setServerBlackMs(data.serverBlackMs || 0);
        setServerSyncTimestamp(data.serverSyncTimestamp || Date.now());
      } else if (data.whiteTimeLeftMs !== undefined) {
        setServerWhiteMs(data.whiteTimeLeftMs);
        setServerBlackMs(data.blackTimeLeftMs || 0);
        setServerSyncTimestamp(Date.now());
      }
    };

    const onOpponentUndo = (data: { fen: string; pgn: string }) => {
      setConsentPending(null);
      setConsentRequest(null);
      if (handlers.syncGameState) {
        handlers.syncGameState(data.pgn);
      } else {
        handlers.applyUndo();
      }
    };

    const onGameReset = () => {
      handlers.resetGame();
    };

    const onUndoRequested = () => setConsentRequest("undo");
    const onUndoDeclined = () => setConsentPending(null);

    const onRematchRequested = () => setConsentRequest("rematch");
    const onRematchAccepted = (data?: any) => {
      setConsentPending(null);
      setConsentRequest(null);
      if (handlers.onRematchAccepted) {
        handlers.onRematchAccepted(data?.newGameId);
      } else {
        handlers.resetGame(); // Fallback for local/computer games
      }
    };
    const onRematchDeclined = () => setConsentPending(null);

    const onDrawOffered = () => setConsentRequest("draw");
    // "game_over" will handle accepted draw, but we also handle specific events if needed
    const onDrawDeclined = () => setConsentPending(null);

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

    socket.on("match_found", onRoomJoined);
    socket.on("game_state", onGameStart);
    socket.on("move_made", onOpponentMove);
    socket.on("opponentUndo", onOpponentUndo);
    socket.on("opponentReset", onGameReset);
    socket.on("opponentDisconnected", handlers.onOpponentDisconnected);
    socket.on("opponentResigned", handlers.onOpponentResigned);
    socket.on("gameTimeout", onTimeout);
    socket.on("undoRequested", onUndoRequested);
    socket.on("undoDeclined", onUndoDeclined);
    socket.on("rematchRequested", onRematchRequested);
    socket.on("rematchAccepted", onRematchAccepted);
    socket.on("rematchDeclined", onRematchDeclined);
    socket.on("draw_offered", onDrawOffered);
    socket.on("draw_declined", onDrawDeclined);
    socket.on("game_aborted", handlers.onOpponentResigned);
    socket.on("queueJoined", onQueueJoined);
    socket.on("left_matchmaking", onQueueLeft);

    return () => {
      socket.off("match_found", onRoomJoined);
      socket.off("game_state", onGameStart);
      socket.off("move_made", onOpponentMove);
      socket.off("opponentUndo", onOpponentUndo);
      socket.off("opponentReset", onGameReset);
      socket.off("opponentDisconnected", handlers.onOpponentDisconnected);
      socket.off("opponentResigned", handlers.onOpponentResigned);
      socket.off("gameTimeout", onTimeout);
      socket.off("undoRequested", onUndoRequested);
      socket.off("undoDeclined", onUndoDeclined);
      socket.off("rematchRequested", onRematchRequested);
      socket.off("rematchAccepted", onRematchAccepted);
      socket.off("rematchDeclined", onRematchDeclined);
      socket.off("draw_offered", onDrawOffered);
      socket.off("draw_declined", onDrawDeclined);
      socket.off("game_aborted", handlers.onOpponentResigned); // Treat abort like resign for UI termination right now, or maybe it should be a custom handler? For now onOpponentResigned is fine.
      socket.off("queueJoined", onQueueJoined);
      socket.off("left_matchmaking", onQueueLeft);
    };
  }, [socket, playerColor, handlers]);

  const handleJoinOnlineRoom = useCallback(() => {
    const room = roomCode.trim();
    if (socket && room !== "") {
      socket.emit("join_game", { room });
      setJoinedRoom(room);
    }
  }, [socket, roomCode]);

  const handleJoinQueue = useCallback(() => {
    if (socket) {
      socket.emit("join_matchmaking", { timeControl, variant });
      setInQueue(true);
    }
  }, [socket, timeControl, variant]);

  const handleLeaveQueue = useCallback(() => {
    if (socket) {
      socket.emit("leave_matchmaking");
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
  }, [socket, joinedRoom]);

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

  const requestDraw = useCallback(() => {
    socket.emit("offer_draw", { gameId: joinedRoom });
    setConsentPending("draw");
  }, [socket, joinedRoom]);

  const acceptDraw = useCallback(() => {
    socket.emit("accept_draw", { gameId: joinedRoom });
    setConsentRequest(null);
  }, [socket, joinedRoom]);

  const declineDraw = useCallback(() => {
    socket.emit("decline_draw", { gameId: joinedRoom });
    setConsentRequest(null);
  }, [socket, joinedRoom]);

  const cancelDrawRequest = useCallback(() => {
    setConsentPending(null);
  }, []);

  const requestAbort = useCallback(() => {
    socket.emit("abort", { gameId: joinedRoom });
  }, [socket, joinedRoom]);

  return useMemo(
    () => ({
      socket,
      playerColor,
      joinedRoom,
      inQueue,
      roomCode,
      userRating: currentRating,
      timeControl,
      setTimeControl,
      variant,
      setVariant,
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
      requestDraw,
      acceptDraw,
      declineDraw,
      cancelDrawRequest,
      requestAbort,
    }),
    [
      socket,
      playerColor,
      joinedRoom,
      inQueue,
      roomCode,
      currentRating,
      timeControl,
      setTimeControl,
      variant,
      setVariant,
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
      requestDraw,
      acceptDraw,
      declineDraw,
      cancelDrawRequest,
      requestAbort,
    ],
  );
}
