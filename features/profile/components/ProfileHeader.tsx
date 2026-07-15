import { memo } from "react";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    rating: number;
    lastActiveBullet?: string | null;
    lastActiveBlitz?: string | null;
    lastActiveRapid?: string | null;
    lastActiveDaily?: string | null;
    createdAt: string;
  };
}

export const ProfileHeader = memo(function ProfileHeader({ user }: ProfileHeaderProps) {
  const lastActiveTimes = [
    user.lastActiveBullet,
    user.lastActiveBlitz,
    user.lastActiveRapid,
    user.lastActiveDaily,
  ].map((t) => (t ? new Date(t).getTime() : 0));

  const latestActive = Math.max(...lastActiveTimes, 0);
  const isOnline = latestActive > 0 && Date.now() - latestActive < 5 * 60 * 1000;

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-cc-bg-card p-6 rounded-3xl border border-cc-border shadow-2xl relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 w-48 h-48 bg-cc-bg-hover rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        {/* Avatar Area */}
        <div className="relative">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-cc-border-light shadow-xl bg-cc-bg-input flex items-center justify-center select-none group transition-all duration-300 hover:border-cc-border-hover">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="text-4xl text-cc-text-primary font-serif font-extrabold uppercase">
                {user.name.slice(0, 2)}
              </span>
            )}
          </div>
          {/* Online badge */}
          <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-cc-bg-page shadow-md flex items-center justify-center ${
            isOnline ? "bg-cc-green" : "bg-cc-text-muted"
          }`}>
            <span className={`w-2 h-2 rounded-full bg-white ${isOnline ? "animate-pulse" : ""}`} />
          </span>
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-1.5">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
            <h1 className="text-2xl md:text-3xl font-serif font-black text-cc-text-primary tracking-wide drop-shadow-md">
              {user.name}
            </h1>
          </div>

          <p className="text-xs text-cc-text-secondary font-medium">@{user.name.toLowerCase().replace(/\s+/g, "")}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-cc-text-secondary font-semibold mt-2.5">
            <span className="flex items-center gap-1.5 text-cc-text-secondary">
              📅 Member since {joinDate}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cc-border-light" />
            <span className="flex items-center gap-1.5 text-cc-text-secondary">
              📈 Rating: <strong className="text-cc-text-primary font-mono">{user.rating} Elo</strong>
            </span>
          </div>
        </div>

        {/* Action Button Area */}
        <div className="flex gap-2.5 w-full md:w-auto mt-4 md:mt-0 select-none">
          <button className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold rounded-xl bg-cc-green hover:bg-cc-green-hover text-white transition-all shadow-md active:scale-95 cursor-pointer">
            Challenge
          </button>
          <button className="flex-1 md:flex-none px-4 py-2.5 text-xs font-bold rounded-xl bg-cc-bg-sidebar/60 hover:bg-cc-bg-sidebar border border-cc-border-light text-cc-text-secondary hover:text-white transition-all active:scale-95 cursor-pointer">
            Message
          </button>
        </div>
      </div>
    </div>
  );
});
