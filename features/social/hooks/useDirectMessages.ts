import { useEffect } from 'react';
import { getSocket } from '@/lib/socket-client';
import { useMessagesStore } from '../store/messagesStore';
import { messagesApi, type DirectMessage } from '../api/messagesApi';
import toast from 'react-hot-toast';

export function useDirectMessages() {
  const { conversations, threadMessages, activeThreadPartnerId, isPanelOpen, addIncomingMessage, setConversations, setThreadMessages, openThread, closeThread, openPanel, closePanel } = useMessagesStore();

  useEffect(() => {
    const onDmReceived = (message: DirectMessage) => {
      addIncomingMessage(message);
      if (useMessagesStore.getState().activeThreadPartnerId !== message.senderId || !useMessagesStore.getState().isPanelOpen) {
        toast('New message received', { icon: '💬' });
      }
    };

    const socket = getSocket();
    socket.on('dmReceived', onDmReceived);

    return () => {
      socket.off('dmReceived', onDmReceived);
    };
  }, [addIncomingMessage]);

  const refreshConversations = async () => {
    try {
      const data = await messagesApi.listConversations();
      setConversations(data);
    } catch {
      toast.error('Failed to load conversations');
    }
  };

  const loadThread = async (partnerId: string) => {
    openThread(partnerId);
    try {
      const data = await messagesApi.getConversation(partnerId);
      setThreadMessages(data);
    } catch {
      toast.error('Failed to load conversation');
    }
  };

  const sendMessage = async (partnerId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      const message = await messagesApi.sendMessage(partnerId, trimmed);
      useMessagesStore.getState().addOutgoingMessage(message);
    } catch {
      toast.error('Failed to send message');
    }
  };

  return {
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
  };
}
