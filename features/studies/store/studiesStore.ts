import { create } from 'zustand';
import { Study, Chapter } from '../api/studiesApi';

interface StudyState {
  activeStudy: Study | null;
  activeChapterId: string | null;
  isLoading: boolean;
  
  setActiveStudy: (study: Study | null) => void;
  setActiveChapterId: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  updateActiveChapter: (data: Partial<Chapter>) => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  activeStudy: null,
  activeChapterId: null,
  isLoading: false,
  
  setActiveStudy: (study) => set({ activeStudy: study, activeChapterId: study?.chapters?.[0]?.id || null }),
  setActiveChapterId: (id) => set({ activeChapterId: id }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  updateActiveChapter: (data) => set((state) => {
    if (!state.activeStudy || !state.activeStudy.chapters) return state;
    const chapters = state.activeStudy.chapters.map((c: Chapter) => 
      c.id === state.activeChapterId ? { ...c, ...data } : c
    );
    return { activeStudy: { ...state.activeStudy, chapters } };
  }),
}));
