'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, ArrowLeft, Send } from 'lucide-react';
import { useDirectMessages } from '../../hooks/useDirectMessages';

const MAX_THREAD_MESSAGES = 200;

export function MessagesPanel() {
  const {
    conversations,
    threadMessages,
    activeThreadPartnerId,
    isPanelOpen,
    openPanel,
    closePanel,
    closeThread,
    refreshConversations,
    loadThread,
    sendMessage,
  } = useDirectMessages();

  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPanelOpen) {
      refreshConversations();
    }
  }, [isPanelOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const activePartner = conversations.find((c) => c.partner.id === activeThreadPartnerId)?.partner;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadPartnerId || !input.trim()) return;
    sendMessage(activeThreadPartnerId, input.trim());
    setInput('');
  };

  if (!isPanelOpen) {
    return (
      <button
        onClick={() => openPanel()}
        className="fixed bottom-4 left-4 p-4 rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover transition-all z-40 flex items-center justify-center"
      >
        <MessageCircle size={24} />
        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-surface">
            {unreadTotal}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-80 h-96 flex flex-col rounded-2xl shadow-2xl bg-surface border border-surface-highlight overflow-hidden">
      <div className="px-4 py-3 bg-surface-highlight flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeThreadPartnerId && (
            <button onClick={closeThread} className="text-text-secondary hover:text-text-primary transition-colors">
              <ArrowLeft size={16} />
            </button>
          )}
          <MessageCircle size={16} className="text-primary" />
          <h3 className="font-bold text-sm text-text-primary">
            {activePartner ? activePartner.name : 'Messages'}
          </h3>
        </div>
        <button onClick={closePanel} className="text-text-secondary hover:text-text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {activeThreadPartnerId ? (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 flex flex-col scrollbar-thin">
            {threadMessages.slice(-MAX_THREAD_MESSAGES).map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] px-3 py-1.5 rounded-lg text-sm break-words ${
                  message.senderId === activeThreadPartnerId
                    ? 'self-start bg-surface-highlight text-text-primary'
                    : 'self-end bg-primary text-white'
                }`}
              >
                {message.content}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={handleSend} className="p-3 border-t border-surface-highlight flex gap-2">
            <input
              type="text"
              placeholder="Message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-surface-highlight text-sm text-text-primary px-3 py-2 rounded-lg border border-transparent focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-3 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </form>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-sm text-text-secondary text-center py-8">No conversations yet.</div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.partner.id}
                onClick={() => loadThread(conversation.partner.id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-surface-highlight rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center text-text-primary font-bold shrink-0">
                  {conversation.partner.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary truncate">{conversation.partner.name}</span>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-secondary truncate block">{conversation.lastMessage.content}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
