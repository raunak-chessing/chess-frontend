import { memo, useState, useMemo } from "react";
import { ACADEMY_LESSONS, AcademyLesson } from "../../constants/lessons";
import { Card } from "../../../../components/ui/Card";
import { SelectableCard } from "../../../../components/ui/SelectableCard";

interface AcademyDashboardProps {
  completedLessons: string[];
  onSelectLesson: (id: string) => void;
  onSelectExplorer: () => void;
}

const LEVEL_TABS = [
  {
    id: "beginner",
    name: "Beginner",
    elo: "0 – 600",
    icon: "♟",
    color: "#81b64c",
    desc: "Master every piece, special rules, and basic checkmate patterns. The foundation that everything else builds on.",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    elo: "600 – 1200",
    icon: "⚔",
    color: "#e5a93d",
    desc: "Build your tactical arsenal: forks, pins, skewers, discovered attacks, sacrifices, and essential checkmate patterns.",
  },
  {
    id: "advanced",
    name: "Advanced",
    elo: "1200 – 1600",
    icon: "🏰",
    color: "#c47dda",
    desc: "Strategic mastery: pawn structures, prophylaxis, endgame theory (Lucena, Philidor), and deadly checkmate patterns.",
  },
  {
    id: "mastery",
    name: "Mastery",
    elo: "1600+",
    icon: "👑",
    color: "#e86b6b",
    desc: "Opening theory at the grandmaster level: Sicilian Najdorf, Ruy Lopez, Queen's Gambit, King's Indian, and more.",
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Piece Movement": "♞",
  "Special Rules": "✦",
  "Basic Checkmates": "♚",
  "Tactics: Fork": "⚡",
  "Tactics: Pin": "📌",
  "Tactics: Skewer": "🗡",
  "Tactics: Discovered Attack": "💥",
  "Tactics: Sacrifice": "🔥",
  "Tactics: Checkmate Pattern": "☠",
  "Tactics: Deflection": "↪",
  "Tactics: Zwischenzug": "⏳",
  "Strategy: Pawn Structure": "🧱",
  "Strategy: Nimzowitsch": "🧠",
  "Endgame: King & Pawn": "♔",
  "Endgame: Rook Endgame": "♜",
  "Checkmate Patterns": "💀",
  "Openings: e4": "⚪",
  "Openings: d4": "⚫",
};

export const AcademyDashboard = memo(function AcademyDashboard({
  completedLessons,
  onSelectLesson,
  onSelectExplorer,
}: AcademyDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("beginner");

  const totalLessons = ACADEMY_LESSONS.length;
  const completedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  const filteredLessons = ACADEMY_LESSONS.filter((l) => l.level === activeTab);
  const tabTotal = filteredLessons.length;
  const tabCompleted = filteredLessons.filter((l) => completedLessons.includes(l.id)).length;
  const tabPercent = tabTotal > 0 ? (tabCompleted / tabTotal) * 100 : 0;

  const currentTabInfo = LEVEL_TABS.find((t) => t.id === activeTab)!;

  const groupedByCategory = useMemo(() => {
    const groups: { category: string; lessons: AcademyLesson[] }[] = [];
    const categoryOrder: string[] = [];

    filteredLessons.forEach((lesson) => {
      if (!categoryOrder.includes(lesson.category)) {
        categoryOrder.push(lesson.category);
      }
    });

    categoryOrder.forEach((cat) => {
      groups.push({
        category: cat,
        lessons: filteredLessons.filter((l) => l.category === cat),
      });
    });

    return groups;
  }, [filteredLessons]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1000px] mx-auto p-4 select-none">
      {/* Hero Banner */}
      <Card className="p-6 md:p-8 rounded-3xl relative overflow-hidden">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="flex flex-col gap-2 text-left">
            <div className="flex items-center gap-3">
              <span className="text-3xl">♛</span>
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] font-mono block text-cc-text-secondary">
                  Chess Arena Academy
                </span>
                <h1 className="text-2xl md:text-3xl font-black tracking-wide text-cc-text-primary">
                  Master Chess
                </h1>
              </div>
            </div>
            <p className="text-xs text-zinc-400 font-medium max-w-md leading-relaxed mt-1">
              {totalLessons} interactive lessons covering everything from piece movement to grandmaster openings.
              Sourced from the greatest chess books ever written.
            </p>
          </div>

          <button
            onClick={onSelectExplorer}
            className="px-5 py-3 text-xs font-bold rounded-2xl border active:scale-95 transition-all shadow-lg cursor-pointer flex items-center gap-2 bg-cc-bg-input border-cc-border text-cc-text-primary hover:bg-cc-bg-hover"
          >
            <span className="text-base">📖</span>
            Opening Explorer
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="flex flex-col gap-2 mt-6 relative z-10 border-t pt-5 border-cc-border">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-zinc-400">Overall Mastery</span>
            <span className="text-cc-green font-mono">
              {completedCount} / {totalLessons} Lessons
            </span>
          </div>
          <div className="w-full h-3.5 bg-cc-bg-sidebar/80 rounded-full border border-cc-border-light/30 overflow-hidden relative">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-cc-green shadow-[0_0_12px_rgba(129,182,76,0.35)] transition-all duration-700 rounded-full"
            />
            {progressPercent > 5 && (
              <span
                style={{ left: `${Math.max(progressPercent - 3, 2)}%` }}
                className="absolute top-0 h-full flex items-center text-[8px] font-mono font-bold text-white drop-shadow-md"
              >
                {Math.round(progressPercent)}%
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Level Tabs */}
      <div className="flex border-b border-cc-border-light gap-0.5 overflow-x-auto scrollbar-none">
        {LEVEL_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabLessons = ACADEMY_LESSONS.filter((l) => l.level === tab.id);
          const tabDone = tabLessons.filter((l) => completedLessons.includes(l.id)).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-5 text-xs font-bold cursor-pointer border-b-[3px] transition-all flex items-center gap-2 whitespace-nowrap font-sans ${
                isActive
                  ? "bg-white/5"
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }`}
              style={{
                borderBottomColor: isActive ? tab.color : "transparent",
                color: isActive ? tab.color : undefined,
              }}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.name}</span>
              <span
                className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-md border"
                style={{
                  color: isActive ? tab.color : "#6b7280",
                  borderColor: isActive ? `${tab.color}40` : "#374151",
                  backgroundColor: isActive ? `${tab.color}10` : "transparent",
                }}
              >
                {tabDone}/{tabLessons.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Info & Progress */}
      <Card className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-extrabold uppercase tracking-wider font-sans"
              style={{ color: currentTabInfo.color }}
            >
              {currentTabInfo.name} Curriculum
            </span>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border bg-cc-bg-input text-cc-text-secondary border-cc-border">
              {currentTabInfo.elo} Elo
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed max-w-xl">
            {currentTabInfo.desc}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 font-mono text-[10px] text-zinc-400 font-bold shrink-0">
          <span style={{ color: currentTabInfo.color }}>
            {tabCompleted} / {tabTotal} Completed
          </span>
          <div className="w-28 h-2 rounded-full overflow-hidden border bg-cc-bg-input border-cc-border">
            <div
              style={{
                width: `${tabPercent}%`,
                backgroundColor: currentTabInfo.color,
              }}
              className="h-full transition-all duration-500 rounded-full"
            />
          </div>
        </div>
      </Card>

      {/* Lessons grouped by category */}
      <div className="flex flex-col gap-6">
        {groupedByCategory.map((group) => {
          const groupDone = group.lessons.filter((l) => completedLessons.includes(l.id)).length;
          const allDone = groupDone === group.lessons.length;
          const catIcon = CATEGORY_ICONS[group.category] || "📘";

          return (
            <div key={group.category} className="flex flex-col gap-2">
              {/* Category Header */}
              <div className="flex items-center gap-3 px-1">
                <span className="text-lg">{catIcon}</span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-extrabold uppercase tracking-wider font-sans text-cc-text-secondary">
                    {group.category}
                  </span>
                  <div className="flex-1 h-px bg-cc-border-light" />
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                      allDone
                        ? "text-cc-green border-cc-green/30 bg-cc-green/10"
                        : "text-zinc-500 border-cc-border-light bg-cc-bg-sidebar"
                    }`}
                  >
                    {allDone ? "✓ Complete" : `${groupDone}/${group.lessons.length}`}
                  </span>
                </div>
              </div>

              {/* Lesson Cards */}
              <div className="flex flex-col gap-2 pl-1">
                {group.lessons.map((lesson, idx) => {
                  const isDone = completedLessons.includes(lesson.id);
                  const globalIdx = ACADEMY_LESSONS.findIndex((l) => l.id === lesson.id) + 1;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(lesson.id)}
                      className={`group p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-left ${
                        isDone
                          ? "bg-emerald-900/10 border-emerald-900/30 hover:border-emerald-700/50 shadow-sm"
                          : "bg-cc-bg-input border-cc-border hover:bg-cc-bg-hover shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Number Badge */}
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 transition-all ${
                            isDone
                              ? "bg-emerald-900/20 border-emerald-900/40 text-emerald-500"
                              : "bg-slate-900/50 border-slate-700/50 text-zinc-500 group-hover:border-zinc-500/50 group-hover:text-zinc-300"
                          }`}
                        >
                          {isDone ? "✓" : globalIdx}
                        </span>

                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[13px] font-extrabold leading-tight truncate font-sans text-cc-text-primary">
                            {lesson.title}
                          </span>
                          <p className="text-[10px] text-zinc-500 font-medium leading-normal line-clamp-1 max-w-xl">
                            {lesson.theory.slice(0, 120)}...
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <span
                        className={`text-[10px] font-bold font-mono px-4 py-2 rounded-xl border flex items-center gap-1.5 transition-all shrink-0 ${
                          isDone
                            ? "bg-emerald-900/20 border-emerald-900/30 text-emerald-500 group-hover:bg-emerald-900/30"
                            : "bg-slate-900/50 border-slate-800 text-zinc-400 group-hover:text-white group-hover:border-slate-600"
                        }`}
                      >
                        {isDone ? "↻ Replay" : "Start →"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
