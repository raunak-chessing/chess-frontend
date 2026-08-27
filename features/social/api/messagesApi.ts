import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const directMessageSchema = z.object({
  id: z.string(),
  content: z.string(),
  senderId: z.string(),
  receiverId: z.string().nullable(),
  readAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
});
export type DirectMessage = z.infer<typeof directMessageSchema>;

export const conversationPartnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
});

export const conversationSummarySchema = z.object({
  partner: conversationPartnerSchema,
  lastMessage: z.object({
    content: z.string(),
    createdAt: z.coerce.date(),
    senderId: z.string(),
  }),
  unreadCount: z.number(),
});
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;

export const messagesApi = {
  listConversations: () => fetchApi(z.array(conversationSummarySchema), '/api/social/messages'),

  getConversation: (userId: string, cursor?: string) =>
    fetchApi(
      z.array(directMessageSchema),
      `/api/social/messages/${userId}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
    ),

  sendMessage: (userId: string, content: string) =>
    fetchApi(directMessageSchema, `/api/social/messages/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};
