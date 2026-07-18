import { z } from 'zod';

export const PuzzleSchema = z.object({
  id: z.string(),
  fen: z.string(),
  moves: z.array(z.string()),
  rating: z.number(),
  themes: z.array(z.string()),
});
export type Puzzle = z.infer<typeof PuzzleSchema>;

export const DailyPuzzleSchema = z.object({
  id: z.string(),
  date: z.string(),
  puzzleId: z.string(),
  puzzle: PuzzleSchema,
});
export type DailyPuzzle = z.infer<typeof DailyPuzzleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
  ratingPuzzle: z.number(),
});
export type User = z.infer<typeof UserSchema>;

export const DailyPuzzleCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  user: UserSchema,
});
export type DailyPuzzleComment = z.infer<typeof DailyPuzzleCommentSchema>;

export const PuzzleResultSchema = z.object({
  newRating: z.number(),
  ratingChange: z.number(),
  success: z.boolean(),
});
export type PuzzleResult = z.infer<typeof PuzzleResultSchema>;

import { fetchApi } from '@/lib/api-client';

export const puzzlesApi = {
  getRatedPuzzle: async (): Promise<Puzzle> => {
    const res = await fetchApi('/api/puzzles/rated');
    return PuzzleSchema.parse(res);
  },

  getCustomPuzzles: async (theme: string, limit: number = 10): Promise<Puzzle[]> => {
    const res = await fetchApi(`/api/puzzles/custom?theme=${theme}&limit=${limit}`);
    return z.array(PuzzleSchema).parse(res);
  },

  getDailyPuzzle: async (): Promise<DailyPuzzle> => {
    const res = await fetchApi('/api/puzzles/daily');
    return DailyPuzzleSchema.parse(res);
  },

  getDailyPuzzleComments: async (dailyPuzzleId: string): Promise<DailyPuzzleComment[]> => {
    const res = await fetchApi(`/api/puzzles/daily/${dailyPuzzleId}/comments`);
    return z.array(DailyPuzzleCommentSchema).parse(res);
  },

  addDailyPuzzleComment: async (dailyPuzzleId: string, content: string): Promise<DailyPuzzleComment> => {
    const res = await fetchApi(`/api/puzzles/daily/${dailyPuzzleId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return DailyPuzzleCommentSchema.parse(res);
  },

  getRushBatch: async (limit: number = 20): Promise<Puzzle[]> => {
    const res = await fetchApi(`/api/puzzles/rush?limit=${limit}`);
    return z.array(PuzzleSchema).parse(res);
  },

  submitAttempt: async (puzzleId: string, success: boolean, timeSpentMs: number): Promise<PuzzleResult> => {
    const res = await fetchApi('/api/puzzles/solve', {
      method: 'POST',
      body: JSON.stringify({ puzzleId, success, timeSpentMs }),
    });
    return PuzzleResultSchema.parse(res);
  }
};
