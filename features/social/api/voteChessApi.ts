import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const BossFightStateSchema = z.object({
  status: z.string(),
  state: z.object({
    fen: z.string(),
    isActive: z.boolean(),
    turnCount: z.number(),
  }),
});
export type BossFightState = z.infer<typeof BossFightStateSchema>;

export const VoteResultSchema = z.object({
  success: z.boolean(),
  move: z.string(),
});

export const voteChessApi = {
  getState: () => fetchApi(BossFightStateSchema, '/api/vote-chess/state'),
  submitVote: (sanMove: string) => fetchApi(VoteResultSchema, '/api/vote-chess/vote', {
    method: 'POST',
    body: JSON.stringify({ sanMove }),
  }),
};
