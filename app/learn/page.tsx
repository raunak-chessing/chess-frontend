"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AcademyDashboard,
  InteractiveLesson,
  OpeningExplorer,
  ACADEMY_LESSONS,
  AcademyLesson,
} from "@/features/academy";
import { fetchApi } from "@/lib/api-client";

type LearnViewState = "dashboard" | "lesson" | "explorer";

export default function LearnPage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<LearnViewState>("dashboard");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch progress from backend
  useEffect(() => {
    fetchApi("/api/academy/progress")
      .then((data) => {
        if (Array.isArray(data)) {
          setCompletedLessons(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setViewState("lesson");
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);

      // Call API backend to complete lesson (saves to PostgreSQL)
      fetchApi(`/api/academy/complete/${lessonId}`, {
        method: "POST",
      }).catch(() => {});
    }
  };

  const handleReturnToDashboard = () => {
    setViewState("dashboard");
    setSelectedLessonId(null);
  };

  const activeLesson = ACADEMY_LESSONS.find((l) => l.id === selectedLessonId);

  return (
    <main className="min-h-screen bg-cc-bg-page py-8 px-4 flex flex-col items-center relative overflow-hidden text-cc-text-primary">
      <div className="grid-background pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col gap-4 relative z-10">
        {/* Navigation Header */}
        {viewState === "dashboard" && (
          <div className="flex items-center justify-between text-xs text-cc-text-secondary font-bold border-b border-cc-border-light pb-3 mb-1 w-full max-w-[960px] mx-auto">
            <button
              onClick={() => router.push("/")}
              className="hover:text-cc-text-primary transition-colors flex items-center gap-1.5 cursor-pointer font-serif uppercase tracking-wider"
            >
              <span>←</span> Return to Lobby
            </button>
            <span className="font-mono text-[10px] text-cc-text-muted uppercase tracking-widest">
              Interactive Academy
            </span>
          </div>
        )}

        {/* View State Router */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-3 border-cc-text-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-serif font-extrabold text-cc-text-primary/80 tracking-widest uppercase">
              Loading Academy Progress...
            </span>
          </div>
        ) : viewState === "lesson" && activeLesson ? (
          <InteractiveLesson
            lesson={activeLesson}
            onReturnToDashboard={handleReturnToDashboard}
            onCompleteLesson={handleCompleteLesson}
          />
        ) : viewState === "explorer" ? (
          <OpeningExplorer onReturnToDashboard={handleReturnToDashboard} />
        ) : (
          <AcademyDashboard
            completedLessons={completedLessons}
            onSelectLesson={handleSelectLesson}
            onSelectExplorer={() => setViewState("explorer")}
          />
        )}
      </div>
    </main>
  );
}
