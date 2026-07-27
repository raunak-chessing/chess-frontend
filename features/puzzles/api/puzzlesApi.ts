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
    return fetchApi(PuzzleSchema, '/api/puzzles/rated');
  },

  submitRatedPuzzle: async (puzzleId: string, success: boolean, timeSpentMs: number): Promise<PuzzleResult> => {
    return fetchApi(PuzzleResultSchema, `/api/puzzles/rated/${puzzleId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ success, timeSpentMs }),
    });
  },

  getDailyPuzzle: async (): Promise<DailyPuzzle> => {
    return fetchApi(DailyPuzzleSchema, '/api/puzzles/daily');
  },

  getDailyPuzzleComments: async (puzzleId: string): Promise<DailyPuzzleComment[]> => {
    return fetchApi(z.array(DailyPuzzleCommentSchema), `/api/puzzles/daily/${puzzleId}/comments`);
  },

  addDailyPuzzleComment: async (puzzleId: string, content: string): Promise<DailyPuzzleComment> => {
    return fetchApi(DailyPuzzleCommentSchema, `/api/puzzles/daily/${puzzleId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  getRushBatch: async (limit: number = 20): Promise<Puzzle[]> => {
    return fetchApi(z.array(PuzzleSchema), `/api/puzzles/rush?limit=${limit}`);
  },

  submitAttempt: async (puzzleId: string, success: boolean, timeSpentMs: number): Promise<PuzzleResult> => {
    return fetchApi(PuzzleResultSchema, '/api/puzzles/solve', {
      method: 'POST',
      body: JSON.stringify({ puzzleId, success, timeSpentMs }),
    });
  }
};
