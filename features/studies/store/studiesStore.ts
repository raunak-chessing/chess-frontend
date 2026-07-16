import { create } from 'zustand';

interface StudyState {
  activeStudy: any | null;
  activeChapterId: string | null;
  
  setActiveStudy: (study: any) => void;
  setActiveChapterId: (id: string) => void;
  updateActiveChapter: (data: any) => void;
}

export const useStudyStore = create<StudyState>((set) => ({
  activeStudy: null,
  activeChapterId: null,
  
  setActiveStudy: (study) => set({ activeStudy: study, activeChapterId: study?.chapters?.[0]?.id || null }),
  setActiveChapterId: (id) => set({ activeChapterId: id }),
  updateActiveChapter: (data) => set((state) => {
    if (!state.activeStudy) return state;
    const chapters = state.activeStudy.chapters.map((c: any) => 
      c.id === state.activeChapterId ? { ...c, ...data } : c
    );
    return { activeStudy: { ...state.activeStudy, chapters } };
  }),
}));
