import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const WagerOddsSchema = z.object({
  status: z.string(),
  gameId: z.string(),
  odds: z.record(z.string(), z.number()),
});
export type WagerOdds = z.infer<typeof WagerOddsSchema>;

export const WagerResultSchema = z.object({
  success: z.boolean(),
  odds: z.number(),
});

export const wagerApi = {
  getOdds: (gameId: string) => fetchApi(WagerOddsSchema, `/api/social/wagers/${gameId}/odds`),
  placeWager: (gameId: string, predictedWinnerId: string, amount: number) => 
    fetchApi(WagerResultSchema, `/api/social/wagers/${gameId}`, {
      method: 'POST',
      body: JSON.stringify({ predictedWinnerId, amount })
    }),
};
