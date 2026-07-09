"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between border-b border-zinc-800/40">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#81b64c] rounded-lg flex items-center justify-center shadow-md shadow-green-950/20">
          <span className="text-lg text-white font-bold">♔</span>
        </div>
        <span className="font-bold tracking-tight text-white text-lg">
          Chess Arena
        </span>
      </div>

      <div>
        {isPending ? (
          <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
        ) : session ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-white">
                {session.user.name}
              </span>
              <span className="text-[10px] text-[#81b64c] font-bold">
                Elo: 1200
              </span>
            </div>
            <button
              onClick={() => authClient.signOut()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/50 hover:border-zinc-600 rounded-lg text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
              id="home-logout"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-transparent hover:bg-zinc-800/40 border border-transparent rounded-lg text-xs font-semibold text-zinc-300 transition-all cursor-pointer"
              id="home-login"
            >
              Log In
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-4 py-2 bg-[#81b64c] hover:bg-[#6fa33f] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md shadow-green-950/10"
              id="home-signup"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
