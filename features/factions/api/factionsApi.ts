import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const FactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  colorTheme: z.string(),
  totalScore: z.number(),
  _count: z.object({
    users: z.number(),
  }).optional(),
});
export type Faction = z.infer<typeof FactionSchema>;

export const FactionListSchema = z.array(FactionSchema);

export const getFactions = async (): Promise<Faction[]> => {
  return fetchApi('/api/factions').then(res => FactionListSchema.parse(res));
};

export const joinFaction = async (factionId: string): Promise<void> => {
  return fetchApi('/api/factions/join', {
    method: 'POST',
    body: JSON.stringify({ factionId }),
  });
};
