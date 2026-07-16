"use client";

import { useState } from "react";
import { usePuzzlesStore } from "../../../features/puzzles/store/puzzlesStore";
import { PuzzleSolver } from "../../../features/puzzles/components/PuzzleSolver";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const THEMES = [
  { id: "endgame", label: "Endgame", icon: "♚" },
  { id: "fork", label: "Fork", icon: "♆" },
  { id: "pin", label: "Pin", icon: "📌" },
  { id: "mateIn2", label: "Mate in 2", icon: "⚔️" },
  { id: "skewer", label: "Skewer", icon: "🍢" },
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

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 h-full overflow-y-auto">
      <div className="flex justify-between w-full max-w-[1100px] mb-8">
        <Link href="/puzzles" className="text-zinc-400 hover:text-white transition-colors">
          ← Back to Puzzles
        </Link>
        <div className="text-xl font-bold font-serif text-white">
          Custom Puzzles
        </div>
      </div>

      {!selectedTheme ? (
        <div className="w-full max-w-[800px] bg-cc-bg-card p-8 rounded-2xl border border-cc-border shadow-xl">
          <h2 className="text-2xl font-serif font-extrabold text-white mb-2 text-center">Choose a Motif</h2>
          <p className="text-zinc-400 text-center mb-8">Focus your training on specific tactical patterns.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className="flex flex-col items-center gap-2 p-6 bg-cc-bg-page border border-cc-border hover:border-pink-500 rounded-xl transition-all duration-300 hover:-translate-y-1 shadow-md"
              >
                <span className="text-3xl">{theme.icon}</span>
                <span className="font-bold text-white font-serif">{theme.label}</span>
              </button>
            ))}
          </div>
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
             <div className="flex justify-center items-center h-[400px]">
               <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
             </div>
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
