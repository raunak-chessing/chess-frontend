import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AchievementsListProps {
  userId: string;
}

interface Achievement {
  id: string;
  achievement: string;
  unlockedAt: string;
}

const BADGES = [
  { id: 'FIRST_WIN', name: "First Victory", icon: "🏆", description: "Win your first match." },
  { id: 'GAMES_100', name: "Centurion", icon: "💯", description: "Play 100 matches." },
  { id: 'BEAT_1500', name: "Giant Slayer", icon: "🗡️", description: "Defeat an opponent rated 1500+." },
  { id: 'REACHED_1500', name: "Expert", icon: "💎", description: "Reach a rating of 1500+." },
  { id: 'SMOTHERED_MATE', name: "Suffocator", icon: "👑", description: "Deliver a smothered mate." },
];

export function AchievementsList({ userId }: AchievementsListProps) {
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:4001/api/users/${userId}/achievements`);
        const json = await res.json();
        setAchievements(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [userId]);

  if (loading || !achievements) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-40 text-cc-text-muted">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const unlockedSet = new Set(achievements.map(a => a.achievement));

  return (
    <div className="bg-cc-bg-card p-5 rounded-3xl border border-cc-border shadow-xl w-full">
      <h3 className="text-xs font-serif font-extrabold text-cc-text-primary uppercase tracking-wider border-b border-cc-border-light pb-3 mb-4">
        Achievements & Badges
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedSet.has(badge.id);
          const unlockedData = achievements.find(a => a.achievement === badge.id);

          return (
            <div 
              key={badge.id}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                isUnlocked 
                  ? "bg-cc-bg-surface border-cc-accent-green/30 shadow-[0_0_15px_rgba(20,184,106,0.1)]" 
                  : "bg-cc-bg-sidebar border-cc-border opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
              }`}
            >
              <span className="text-4xl mb-2">{badge.icon}</span>
              <span className="text-[11px] font-bold text-cc-text-primary">{badge.name}</span>
              <span className="text-[9px] text-cc-text-muted font-mono leading-tight mt-1">{badge.description}</span>
              
              {isUnlocked && unlockedData && (
                <span className="text-[8px] font-bold uppercase tracking-wider text-cc-green mt-3 bg-cc-green/10 px-2 py-0.5 rounded-full">
                  Unlocked {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
