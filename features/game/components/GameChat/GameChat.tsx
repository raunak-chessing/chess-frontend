"use client";

import React, { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Card } from "../../../../components/ui/Card";

interface GameChatProps {
  socket: Socket | null;
  room: string;
}

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
}

export function GameChat({ socket, room }: GameChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("gameMessage", onMessage);
    return () => {
      socket.off("gameMessage", onMessage);
    };
  }, [socket]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !room) return;
    
    socket.emit("sendGameMessage", { room, message: input.trim() });
    setInput("");
  };

  return (
    <Card className="w-full h-full max-h-[300px] flex flex-col p-2 bg-cc-bg-sidebar border border-cc-border-light shadow-md">
      <div className="text-xs font-bold font-sans px-2 pb-2 border-b border-cc-border-light mb-2 opacity-70">
        Live Chat
      </div>
      <div className="flex-1 overflow-y-auto px-2 space-y-2 text-sm font-sans flex flex-col scrollbar-thin">
        {messages.length === 0 ? (
          <span className="text-[11px] opacity-50 m-auto">Say hello!</span>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col mt-1">
              <span className="font-bold text-[10px] text-[var(--cc-green)] opacity-90">{msg.sender}</span>
              <span className="text-[var(--cc-text-primary)] leading-tight text-xs break-words">{msg.message}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSend} className="mt-2 flex gap-2 px-1">
        <input
          type="text"
          placeholder="Message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[var(--cc-bg-input)] text-xs text-[var(--cc-text-primary)] px-3 py-1.5 rounded-lg border border-[var(--cc-border)] focus:outline-none focus:border-[var(--cc-green)] transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-3 py-1.5 bg-[var(--cc-green)] hover:bg-[var(--cc-green-hover)] text-white rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </Card>
  );
}
