"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileHeader, StatsGrid, RatingChart, RecentGames } from "@/features/profile";
import { Spinner } from "@/components/ui/Spinner";

interface UserProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    rating: number;
    ratingBullet: number;
    ratingBlitz: number;
    ratingRapid: number;
    ratingDaily: number;
    createdAt: string;
  };
  recentGames: any[];
  stats: any;
}

export default function ProfileDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  const router = useRouter();

  const [data, setData] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:4001/users/${userId}/profile`)
      .then((res) => {
        if (!res.ok) throw new Error("User profile not found.");
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load user profile");
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cc-bg-page flex items-center justify-center p-6 text-cc-text-primary">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <span className="text-xs font-serif font-extrabold text-cc-text-primary/80 tracking-wide uppercase">
            Loading Profile...
          </span>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-cc-bg-page flex flex-col items-center justify-center p-6 text-cc-text-primary gap-4 text-center">
        <span className="text-4xl">🏜️</span>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-serif font-extrabold text-cc-text-primary">Profile Error</h2>
          <p className="text-xs text-cc-text-secondary max-w-xs">{error || "User data is missing."}</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-cc-bg-card border border-cc-border text-cc-text-primary hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          Return Home
        </button>
      </main>
    );
  }

  const ratings = {
    bullet: data.user.ratingBullet,
    blitz: data.user.ratingBlitz,
    rapid: data.user.ratingRapid,
    daily: data.user.ratingDaily,
  };

  return (
    <main className="min-h-screen bg-cc-bg-page py-8 px-4 flex flex-col items-center relative overflow-hidden">
      <div className="grid-background pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col gap-5 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-cc-text-secondary font-bold border-b border-cc-border-light pb-3 mb-1">
          <button
            onClick={() => router.push("/")}
            className="hover:text-cc-text-primary transition-colors flex items-center gap-1.5 cursor-pointer font-serif uppercase tracking-wider"
          >
            <span>←</span> Back to Arena
          </button>
          <span className="font-mono text-[10px] text-cc-text-muted uppercase tracking-widest">Profile Stats</span>
        </div>

        {/* 1. Header Card */}
        <ProfileHeader user={data.user} />

        {/* 2. Rating Pool Cards Grid */}
        <StatsGrid ratings={ratings} stats={data.stats} />

        {/* 3. Graph and Recent History */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          <div className="md:col-span-6 lg:col-span-7">
            <RatingChart recentGames={data.recentGames} userRating={data.user.rating} userId={data.user.id} />
          </div>
          <div className="md:col-span-6 lg:col-span-5">
            <RecentGames recentGames={data.recentGames} userId={data.user.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
