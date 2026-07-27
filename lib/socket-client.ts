import { useEffect, useState } from "react";

type EventCallback = (...args: any[]) => void;

class WebSocketClient {
  public connected = false;
  private ws: WebSocket | null = null;
  private listeners: Record<string, EventCallback[]> = {};
  private url: string;
  private reconnectTimer: any = null;

  constructor() {
    let wsUrl = process.env.NEXT_PUBLIC_API_URL || "ws://localhost:3002";
    if (wsUrl.startsWith("http")) {
      wsUrl = wsUrl.replace(/^http/, "ws");
    }
    // Go gameserver runs on port 8080 by default in this project (as seen in hub.go / main.go usually)
    // Actually the standard is 3001 for Nest, 8080 for Go.
    this.url = "ws://localhost:8080/ws";
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) return;
    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = () => {
        this.connected = true;
        this.trigger("connect");
      };
      this.ws.onclose = () => {
        this.connected = false;
        this.trigger("disconnect");
        this.ws = null;
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
          }, 2000);
        }
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const type = data.Type || data.type;
          let payload = data.Payload || data.payload;
          if (!payload && data.GameID) {
            payload = data;
          }
          this.trigger(type, payload || data);
        } catch (e) {
          console.error("WS parse error", e);
        }
      };
    } catch (e) {
      console.error("WS connect error", e);
    }
  }

  disconnect() {
    this.ws?.close();
  }

  on(event: string, cb: EventCallback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }

  off(event: string, cb: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== cb);
  }

  emit(event: string, payload?: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      let gameId = "";
      if (payload && payload.room) {
          gameId = payload.room;
      }
      this.ws.send(JSON.stringify({
        type: event,
        gameId: gameId,
        payload: payload
      }));
    }
  }

  private trigger(event: string, ...args: any[]) {
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

export function useSocket(): WebSocketClient | null {
  const [sock, setSock] = useState<WebSocketClient | null>(null);
  
  useEffect(() => {
    const s = getSocket();
    setSock(s);
  }, []);

  return sock;
}
