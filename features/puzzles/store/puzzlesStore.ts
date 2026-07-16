import { create } from 'zustand';
import { puzzlesApi, Puzzle, DailyPuzzle, DailyPuzzleComment } from '../api/puzzlesApi';
import toast from 'react-hot-toast';

interface PuzzlesState {
  // Common
  isLoading: boolean;
  
  // Rated Mode
  currentRatedPuzzle: Puzzle | null;
  ratedPuzzleRatingChange: number | null;
  fetchRatedPuzzle: () => Promise<void>;
  
  // Rush / Survival Mode
  rushBatch: Puzzle[];
  currentRushIndex: number;
  fetchRushBatch: (limit?: number) => Promise<void>;
  nextRushPuzzle: () => void;
  resetRush: () => void;

  // Custom Mode
  customPuzzles: Puzzle[];
  fetchCustomPuzzles: (theme: string, limit?: number) => Promise<void>;

  // Submitting
  submitAttempt: (puzzleId: string, success: boolean, timeSpentMs: number) => Promise<void>;

  // Daily Mode
  currentDailyPuzzle: DailyPuzzle | null;
  dailyPuzzleComments: DailyPuzzleComment[];
  fetchDailyPuzzle: () => Promise<void>;
  fetchDailyPuzzleComments: (dailyPuzzleId: string) => Promise<void>;
  addDailyPuzzleComment: (dailyPuzzleId: string, content: string) => Promise<void>;
}

export const usePuzzlesStore = create<PuzzlesState>((set, get) => ({
  isLoading: false,
  
  currentRatedPuzzle: null,
  ratedPuzzleRatingChange: null,
  
  fetchRatedPuzzle: async () => {
    set({ isLoading: true, ratedPuzzleRatingChange: null });
    try {
      const puzzle = await puzzlesApi.getRatedPuzzle();
      set({ currentRatedPuzzle: puzzle });
    } catch (error) {
      toast.error('Failed to fetch rated puzzle');
    } finally {
      set({ isLoading: false });
    }
  },

  rushBatch: [],
  currentRushIndex: 0,
  
  fetchRushBatch: async (limit = 20) => {
    set({ isLoading: true });
    try {
      const batch = await puzzlesApi.getRushBatch(limit);
      set({ rushBatch: batch, currentRushIndex: 0 });
    } catch (error) {
      toast.error('Failed to fetch puzzle rush batch');
    } finally {
      set({ isLoading: false });
    }
  },

  nextRushPuzzle: () => {
    const { currentRushIndex, rushBatch } = get();
    if (currentRushIndex < rushBatch.length - 1) {
      set({ currentRushIndex: currentRushIndex + 1 });
    } else {
      // Need to fetch more
      get().fetchRushBatch();
    }
  },

  resetRush: () => {
    set({ rushBatch: [], currentRushIndex: 0 });
  },

  customPuzzles: [],
  fetchCustomPuzzles: async (theme: string, limit = 10) => {
    set({ isLoading: true });
    try {
      const puzzles = await puzzlesApi.getCustomPuzzles(theme, limit);
      set({ customPuzzles: puzzles });
    } catch (error) {
      toast.error('Failed to fetch custom puzzles');
    } finally {
      set({ isLoading: false });
    }
  },

  submitAttempt: async (puzzleId: string, success: boolean, timeSpentMs: number) => {
    try {
      const result = await puzzlesApi.submitAttempt(puzzleId, success, timeSpentMs);
      set({ ratedPuzzleRatingChange: result.ratingChange });
    } catch (error) {
      console.error('Failed to submit puzzle attempt', error);
    }
  },

  currentDailyPuzzle: null,
  dailyPuzzleComments: [],

  fetchDailyPuzzle: async () => {
    set({ isLoading: true });
    try {
      const daily = await puzzlesApi.getDailyPuzzle();
      set({ currentDailyPuzzle: daily });
    } catch (error) {
      toast.error('Failed to fetch daily puzzle');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDailyPuzzleComments: async (dailyPuzzleId: string) => {
    try {
      const comments = await puzzlesApi.getDailyPuzzleComments(dailyPuzzleId);
      set({ dailyPuzzleComments: comments });
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  },

  addDailyPuzzleComment: async (dailyPuzzleId: string, content: string) => {
    try {
      const newComment = await puzzlesApi.addDailyPuzzleComment(dailyPuzzleId, content);
      set(state => ({
        dailyPuzzleComments: [newComment, ...state.dailyPuzzleComments]
      }));
    } catch (error) {
      toast.error('Failed to add comment');
    }
  }
}));
