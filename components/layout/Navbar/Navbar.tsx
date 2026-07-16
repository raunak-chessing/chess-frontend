"use client";

import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Users } from 'lucide-react';
import { useSocialStore } from "@/features/social/store/socialStore";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/play", label: "Play", icon: "⚡" },
  { href: "/puzzles", label: "Puzzles", icon: "🧩" },
  { href: "/tournaments", label: "Tournaments", icon: "🏆" },
  { href: "/studies", label: "Studies", icon: "📚" },
  { href: "/learn", label: "Learn", icon: "📖" },
] as const;

function isExactActiveLink(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/play") return pathname.startsWith("/play");
  return pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { toggleSidebar } = useSocialStore();

  return (
    <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-4 md:px-6 h-14 border-b bg-[var(--cc-bg-card)] border-[var(--cc-border)]">
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer group"
          id="navbar-logo"
        >
          <div className="w-8 h-8 rounded-md flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 bg-[var(--cc-green)]">
            <span className="text-white font-bold text-base leading-none">♔</span>
          </div>
          <span className="font-extrabold text-base tracking-tight hidden sm:inline text-[var(--cc-text-primary)]">
            Chess Arena
          </span>
        </button>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isExactActiveLink(pathname, link.href);
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 hover:bg-[var(--cc-bg-hover)] ${
                  active ? "bg-[var(--cc-bg-hover)] text-[var(--cc-green)]" : "bg-transparent text-[var(--cc-text-secondary)]"
                }`}
                id={`navbar-link-${link.label.toLowerCase()}`}
              >
                <span className="text-sm">{link.icon}</span>
                <span className="hidden md:inline">{link.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isPending ? (
          <div className="h-8 w-20 rounded animate-pulse bg-[var(--cc-bg-input)]" />
        ) : session ? (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md transition-colors text-[var(--cc-text-secondary)] hover:text-[var(--cc-green)] hover:bg-[var(--cc-bg-hover)]"
              title="Friends"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 rounded-md transition-colors bg-transparent hover:bg-[var(--cc-bg-hover)]"
              id="navbar-profile"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-7 h-7 rounded-full border border-[var(--cc-border-light)]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[var(--cc-green)] text-white">
                  {(session.user.name || "U")[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold hidden sm:inline group-hover:opacity-80 transition-opacity text-[var(--cc-text-primary)]">
                {session.user.name}
              </span>
            </button>
            <button
              onClick={async () => {
                await authClient.signOut();
                router.refresh();
              }}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border bg-transparent hover:bg-[var(--cc-bg-hover)] border-[var(--cc-border)] hover:border-[var(--cc-border-light)] text-[var(--cc-text-secondary)]"
              id="navbar-logout"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/login")}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer bg-transparent hover:bg-[var(--cc-bg-hover)] text-[var(--cc-text-secondary)]"
              id="navbar-login"
            >
              Log In
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-sm bg-[var(--cc-green)] hover:bg-[var(--cc-green-hover)] text-white"
              id="navbar-signup"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
