"use client";

import { useState } from "react";
import { usePuzzlesStore } from "../../../features/puzzles/store/puzzlesStore";
import { PuzzleSolver } from "../../../features/puzzles/components/PuzzleSolver";
import { Crown, Anchor, Pin, Swords, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { OptionCardGrid, type OptionCardItem } from "@/components/features/OptionCardGrid";

const THEMES = [
  { id: "endgame", label: "Endgame", Icon: Crown, description: "Convert simplified, technical positions." },
  { id: "fork", label: "Fork", Icon: Anchor, description: "Attack two pieces with one move." },
  { id: "pin", label: "Pin", Icon: Pin, description: "Exploit a piece that can't move." },
  { id: "mateIn2", label: "Mate in 2", Icon: Swords, description: "Find the forced two-move checkmate." },
  { id: "skewer", label: "Skewer", Icon: Zap, description: "Force a valuable piece to move aside." },
];

export default function CustomPuzzlesPage() {
  const { customPuzzles, fetchCustomPuzzles, isLoading } = usePuzzlesStore();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSelectTheme = (theme: string) => {
    setSelectedTheme(theme);
    setCurrentIndex(0);
    fetchCustomPuzzles(theme, 10); // Fetch 10 puzzles of this theme
  };

  const handleNext = () => {
    if (currentIndex < customPuzzles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Fetch more if we run out
      if (selectedTheme) {
        fetchCustomPuzzles(selectedTheme, 10);
        setCurrentIndex(0);
      }
    }
  };

  const currentPuzzle = customPuzzles[currentIndex];

  const themeItems: OptionCardItem[] = THEMES.map((theme) => ({
    Icon: theme.Icon,
    title: theme.label,
    description: theme.description,
    accent: "pink",
    onClick: () => handleSelectTheme(theme.id),
  }));

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 h-full overflow-y-auto">
      <PageHeader title="Custom Puzzles" backHref="/puzzles" />

      {!selectedTheme ? (
        <div className="w-full max-w-[800px] bg-cc-bg-card p-8 rounded-2xl border border-cc-border shadow-xl">
          <h2 className="text-2xl font-serif font-extrabold text-white mb-2 text-center">Choose a Motif</h2>
          <p className="text-zinc-400 text-center mb-8">Focus your training on specific tactical patterns.</p>

          <OptionCardGrid items={themeItems} variant="tile" />
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-pink-500/20 text-pink-500 font-bold rounded-lg border border-pink-500/30">
              Theme: {THEMES.find(t => t.id === selectedTheme)?.label || selectedTheme}
            </span>
            <button
              onClick={() => setSelectedTheme(null)}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Change Theme
            </button>
          </div>

          {isLoading && customPuzzles.length === 0 ? (
            <LoadingState label="Fetching puzzles…" />
          ) : currentPuzzle ? (
            <PuzzleSolver
              puzzle={currentPuzzle}
              onSolve={() => {}}
              onFail={() => {}}
              onNext={handleNext}
              showNextButton={true}
            />
          ) : (
            <div className="text-zinc-400">No puzzles found for this theme.</div>
          )}
        </div>
      )}
    </div>
  );
}
