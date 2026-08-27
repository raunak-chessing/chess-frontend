import { create } from 'zustand';
import type { ConversationSummary, DirectMessage } from '../api/messagesApi';

interface MessagesState {
  isPanelOpen: boolean;
  conversations: ConversationSummary[];
  activeThreadPartnerId: string | null;
  threadMessages: DirectMessage[];

  openPanel: () => void;
  closePanel: () => void;

  setConversations: (conversations: ConversationSummary[]) => void;
  setThreadMessages: (messages: DirectMessage[]) => void;
  openThread: (partnerId: string) => void;
  closeThread: () => void;

  addIncomingMessage: (message: DirectMessage) => void;
  addOutgoingMessage: (message: DirectMessage) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  isPanelOpen: false,
  conversations: [],
  activeThreadPartnerId: null,
  threadMessages: [],

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),

  setConversations: (conversations) => set({ conversations }),
  setThreadMessages: (threadMessages) => set({ threadMessages }),
  openThread: (partnerId) => set({ activeThreadPartnerId: partnerId, threadMessages: [] }),
  closeThread: () => set({ activeThreadPartnerId: null, threadMessages: [] }),

  addIncomingMessage: (message) => set((state) => {
    const partnerId = message.senderId;
    const isActiveThread = state.activeThreadPartnerId === partnerId;

    const existing = state.conversations.find((c) => c.partner.id === partnerId);
    const updatedConversation: ConversationSummary = existing
      ? {
          ...existing,
          lastMessage: { content: message.content, createdAt: message.createdAt, senderId: message.senderId },
          unreadCount: isActiveThread ? existing.unreadCount : existing.unreadCount + 1,
        }
      : {
          partner: { id: partnerId, name: 'Unknown', image: null },
          lastMessage: { content: message.content, createdAt: message.createdAt, senderId: message.senderId },
          unreadCount: isActiveThread ? 0 : 1,
        };

    const conversations = [
      updatedConversation,
      ...state.conversations.filter((c) => c.partner.id !== partnerId),
    ];

    return {
      conversations,
      threadMessages: isActiveThread ? [...state.threadMessages, message] : state.threadMessages,
    };
  }),

  addOutgoingMessage: (message) => set((state) => {
    const partnerId = message.receiverId;
    if (!partnerId) return {};

    const existing = state.conversations.find((c) => c.partner.id === partnerId);
    const updatedConversation: ConversationSummary = existing
      ? { ...existing, lastMessage: { content: message.content, createdAt: message.createdAt, senderId: message.senderId }, unreadCount: 0 }
      : {
          partner: { id: partnerId, name: 'Unknown', image: null },
          lastMessage: { content: message.content, createdAt: message.createdAt, senderId: message.senderId },
          unreadCount: 0,
        };

    return {
      conversations: [updatedConversation, ...state.conversations.filter((c) => c.partner.id !== partnerId)],
      threadMessages: state.activeThreadPartnerId === partnerId ? [...state.threadMessages, message] : state.threadMessages,
    };
  }),
}));
