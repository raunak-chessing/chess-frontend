import { useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (...args: any[]) => void;

export class WebSocketClient {
  public connected = false;
  private ws: WebSocket | null = null;
  private listeners: Record<string, EventCallback[]> = {};
  private url: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;

  constructor() {
    let wsUrl = process.env.NEXT_PUBLIC_GAMESERVER_URL || "ws://localhost:8080";
    if (wsUrl.startsWith("http")) {
      wsUrl = wsUrl.replace(/^http/, "ws");
    }
    this.url = `${wsUrl}/ws`;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) return;
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
        this.trigger("connect");
      };
      this.ws.onclose = () => {
        this.connected = false;
        this.trigger("disconnect");
        this.ws = null;
        if (!this.reconnectTimer) {
          const backoff = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts++));
          const delay = backoff * (0.5 + Math.random() * 0.5);
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, delay);
        }
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data.Type || data.type;
          const gameId = data.GameID || data.gameId;
          let payload = data.Payload || data.payload;
          if (payload && typeof payload === "object" && gameId && !("gameId" in payload)) {
            payload = { ...payload, gameId };
          }
          if (!payload && gameId) {
            payload = data;
          }
          this.trigger(type, payload || data);
        } catch (e: unknown) {
          console.error("WS parse error", e);
        }
      };
    } catch (e: unknown) {
      console.error("WS connect error", e);
    }
  }

  disconnect() {
    this.ws?.close();
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== callback);
  }

  emit(event: string, payload?: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      let gameId = "";
      if (payload && typeof payload === "object") {
        if ("room" in payload) {
          gameId = (payload as { room: string }).room;
        } else if ("gameId" in payload) {
          gameId = (payload as { gameId: string }).gameId;
        }
      }
      this.ws.send(JSON.stringify({
        type: event,
        gameId: gameId,
        payload: payload
      }));
    }
  }

  private trigger(event: string, ...args: unknown[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(...args));
    }
  }
}

let socketInstance: WebSocketClient | null = null;

export function getSocket(): WebSocketClient {
  if (!socketInstance) {
    socketInstance = new WebSocketClient();
  }
  return socketInstance;
}

export function connectSocket(): WebSocketClient {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  socketInstance?.disconnect();
}

export function useSocket(): WebSocketClient {
  return getSocket();
}
