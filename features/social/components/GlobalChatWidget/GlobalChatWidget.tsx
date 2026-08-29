'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { getSocket } from '@/lib/socket-client';
import { Card } from '@/components/ui/Card';

const MAX_MESSAGES = 200;

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}

export function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    
    const onMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg].slice(-MAX_MESSAGES));
      if (!isOpen || isMinimized) {
        setUnread(prev => prev + 1);
      }
    };

    socket.on('globalMessage', onMessage);
    return () => {
      socket.off('globalMessage', onMessage);
    };
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const socket = getSocket();
    socket.emit('sendGlobalMessage', { message: input.trim() });
    setInput('');
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnread(0);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleOpen}
        className="fixed bottom-4 right-4 p-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover transition-all z-40 group flex items-center justify-center"
      >
        <MessageSquare size={24} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-cc-bg-card">
            {unread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ease-in-out ${isMinimized ? 'w-64 h-14' : 'w-80 h-96'}`}>
      <Card className="w-full h-full flex flex-col shadow-2xl border-cc-border-light overflow-hidden">
        {/* Header */}
        <div
          className="px-4 py-3 bg-cc-bg-sidebar flex items-center justify-between cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" />
            <h3 className="font-bold text-sm text-cc-text-primary">Global Lobby</h3>
            {isMinimized && unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
              className="p-1 hover:bg-cc-bg-hover rounded text-cc-text-secondary hover:text-cc-text-primary transition-colors"
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="p-1 hover:bg-cc-bg-hover rounded text-cc-text-secondary hover:text-cc-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col scrollbar-thin">
              {messages.length === 0 ? (
                <div className="m-auto text-xs text-cc-text-secondary text-center opacity-70">
                  Welcome to the global lobby!<br/>Say hello to everyone.
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col">
                    <span className="font-bold text-xs text-primary">{msg.sender}</span>
                    <span className="text-sm text-cc-text-primary break-words leading-snug">{msg.message}</span>
                  </div>
                ))
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-cc-border-light flex gap-2">
              <input
                type="text"
                placeholder="Message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-cc-bg-sidebar text-sm text-cc-text-primary px-3 py-2 rounded-lg border border-transparent focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
