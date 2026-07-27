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
  return fetchApi(FactionListSchema, '/api/factions');
};

export const joinFaction = async (factionId: string): Promise<void> => {
  return fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), '/api/factions/join', {
    method: 'POST',
    body: JSON.stringify({ factionId }),
  });
};
