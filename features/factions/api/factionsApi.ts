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
  await fetchApi(z.object({ success: z.boolean().optional() }).passthrough(), '/api/factions/join', {
    method: 'POST',
    body: JSON.stringify({ factionId }),
  });
};

export const DivisionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  factionContribution: z.number(),
  rating: z.number(),
});
export type DivisionUser = z.infer<typeof DivisionUserSchema>;

export const DivisionSchema = z.object({
  id: z.string(),
  tier: z.string(),
  seasonEnd: z.string(),
  users: z.array(DivisionUserSchema),
});
export type Division = z.infer<typeof DivisionSchema>;

export const DivisionListSchema = z.array(DivisionSchema);

export const getDivisions = async (): Promise<Division[]> => {
  return fetchApi(DivisionListSchema, '/api/factions/divisions');
};
