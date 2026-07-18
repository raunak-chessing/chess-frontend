import { z } from 'zod';
import { fetchApi } from '@/lib/api-client';

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number().optional(),
});

export type Player = z.infer<typeof PlayerSchema>;

export const DailyGameSchema = z.object({
  id: z.string(),
  fen: z.string(),
  whitePlayerId: z.string(),
  blackPlayerId: z.string(),
  whitePlayer: PlayerSchema.optional(),
  blackPlayer: PlayerSchema.optional(),
  status: z.string().optional(),
});

export type DailyGame = z.infer<typeof DailyGameSchema>;

export const DailyGameListSchema = z.array(DailyGameSchema);

export const AnalysisMoveSchema = z.object({
  move: z.string(),
  fen: z.string(),
  color: z.string(),
  eval: z.number(),
  mate: z.number().nullable(),
  centipawns: z.number(),
  bestMove: z.string().nullable(),
  classification: z.string(),
  explanation: z.string(),
});

export const AnalysisSchema = z.object({
  whiteAccuracy: z.number(),
  blackAccuracy: z.number(),
  moves: z.array(AnalysisMoveSchema),
});

export const gameApi = {
  getDailyGame: (gameId: string) => fetchApi(`/api/games/daily/${gameId}`).then(res => DailyGameSchema.parse(res)),
  makeDailyMove: (gameId: string, from: string, to: string) => 
    fetchApi(`/api/games/daily/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    }),
  getMyDailyGames: (userId: string) => fetchApi(`/api/games/daily/my-games?userId=${userId}`).then(res => DailyGameListSchema.parse(res)),
  analyzePgn: (pgn: string) => fetchApi(`/api/analysis/pgn`, {
    method: 'POST',
    body: JSON.stringify({ pgn }),
  }).then(res => AnalysisSchema.parse(res)),
};
