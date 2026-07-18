import { create } from 'zustand';
import type { GameVariant, LastMove } from '../types/game.types';

interface GameStoreState {
  fen: string;
  variant: GameVariant;
  selectedSquare: string;
  lastMove: LastMove | null;
  autoFlip: boolean;
  viewMoveIndex: number | null;
  pendingPromotion: { from: string; to: string } | null;
  isFlipped: boolean;
  
  setFen: (fen: string) => void;
  setVariant: (variant: GameVariant) => void;
  setSelectedSquare: (sq: string) => void;
  setLastMove: (move: LastMove | null) => void;
  setAutoFlip: (flip: boolean) => void;
  setViewMoveIndex: (index: number | null) => void;
  setPendingPromotion: (promo: { from: string; to: string } | null) => void;
  setIsFlipped: (flipped: boolean) => void;
  resetStore: () => void;
}

const initialState = {
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  variant: 'standard' as GameVariant,
  selectedSquare: '',
  lastMove: null,
  autoFlip: false,
  viewMoveIndex: null,
  pendingPromotion: null,
  isFlipped: false,
};

export const useGameStore = create<GameStoreState>((set) => ({
  ...initialState,
  
  setFen: (fen) => set({ fen }),
  setVariant: (variant) => set({ variant }),
  setSelectedSquare: (sq) => set({ selectedSquare: sq }),
  setLastMove: (move) => set({ lastMove: move }),
  setAutoFlip: (flip) => set({ autoFlip: flip }),
  setViewMoveIndex: (index) => set({ viewMoveIndex: index }),
  setPendingPromotion: (promo) => set({ pendingPromotion: promo }),
  setIsFlipped: (flipped) => set({ isFlipped: flipped }),
  
  resetStore: () => set(initialState),
}));
