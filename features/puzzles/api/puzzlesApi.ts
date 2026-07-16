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

export interface PuzzleAttemptResult {
  newRating: number;
  ratingChange: number;
  success: boolean;
}

export interface User {
  id: string;
  name: string;
  image?: string;
  ratingPuzzle: number;
}

export interface DailyPuzzleComment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

export const PuzzleResultSchema = z.object({
  newRating: z.number(),
  ratingChange: z.number(),
  success: z.boolean(),
});
export type PuzzleResult = z.infer<typeof PuzzleResultSchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw { response: { data: error } };
  }
  return res.json();
}

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
    return fetchApi(`/api/puzzles/daily/${dailyPuzzleId}/comments`);
  },

  addDailyPuzzleComment: async (dailyPuzzleId: string, content: string): Promise<DailyPuzzleComment> => {
    return fetchApi(`/api/puzzles/daily/${dailyPuzzleId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
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
