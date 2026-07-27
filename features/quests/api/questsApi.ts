import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const QuestSchema = z.object({
  id: z.string(),
  questId: z.string(),
  progress: z.number(),
  target: z.number(),
  completed: z.boolean(),
  rewardClaimed: z.boolean().default(false),
  expiresAt: z.string(),
});
export type Quest = z.infer<typeof QuestSchema>;

export const QuestListSchema = z.array(QuestSchema);

export const ClaimQuestResponseSchema = z.object({
  success: z.boolean(),
  reward: z.object({
    gold: z.number(),
    aetherium: z.number(),
  }),
});

export const getActiveQuests = async (): Promise<Quest[]> => {
  return fetchApi(QuestListSchema, '/api/quests/active');
};

export const claimQuest = async (questId: string): Promise<{ success: boolean, reward: { gold: number, aetherium: number } }> => {
  return fetchApi(ClaimQuestResponseSchema, `/api/quests/${questId}/claim`, { method: 'POST' });
};
