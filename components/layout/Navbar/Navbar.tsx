"use client";

import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Home, Zap, Puzzle, Trophy, BookOpen, GraduationCap, Users, Package, Store, Coins, Sparkles } from "lucide-react";
import { useSocialStore } from "@/features/social/store/socialStore";
import { InventoryModal } from "@/features/inventory/components";
import { ShopModal } from "@/features/shop/components/ShopModal/ShopModal";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { useEffect, useState, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const NAV_LINKS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/play", label: "Play", Icon: Zap },
  { href: "/puzzles", label: "Puzzles", Icon: Puzzle },
  { href: "/tournaments", label: "Tournaments", Icon: Trophy },
  { href: "/studies", label: "Studies", Icon: BookOpen },
  { href: "/learn", label: "Learn", Icon: GraduationCap },
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
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [wallet, setWallet] = useState<{ gold: number; aetherium: number } | null>(null);

  const linksContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLSpanElement>(null);

  const refreshWallet = useCallback(() => {
    if (!session) return;
    inventoryApi.getMyInventory()
      .then((inv) => setWallet({ gold: inv.gold, aetherium: inv.aetherium }))
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const activeHref = NAV_LINKS.find((link) => isExactActiveLink(pathname, link.href))?.href;

  // Slides a pill behind the active link instead of an instant background
  // swap. Falls back to an instant jump under prefers-reduced-motion.
  useGSAP(
    () => {
      const indicator = indicatorRef.current;
      const activeEl = activeHref ? linkRefs.current[activeHref] : null;
      if (!indicator) return;

      if (!activeEl) {
        gsap.set(indicator, { opacity: 0 });
        return;
      }

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const target = {
        x: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      };

      if (prefersReducedMotion) {
        gsap.set(indicator, target);
      } else {
        gsap.to(indicator, { ...target, duration: 0.35, ease: "power3.out" });
      }
    },
    { dependencies: [activeHref], scope: linksContainerRef },
  );

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

        <div ref={linksContainerRef} className="relative flex items-center gap-1">
          <span
            ref={indicatorRef}
            className="absolute left-0 top-0 h-full rounded-md bg-[var(--cc-bg-hover)] opacity-0"
            style={{ willChange: "transform, width, opacity" }}
            aria-hidden="true"
          />
          {NAV_LINKS.map(({ href, label, Icon }) => {
            const active = isExactActiveLink(pathname, href);
            return (
              <button
                key={href}
                ref={(el) => {
                  linkRefs.current[href] = el;
                }}
                onClick={() => router.push(href)}
                className={`relative px-3 py-1.5 rounded-md text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  active ? "text-[var(--cc-green)]" : "text-[var(--cc-text-secondary)] hover:text-[var(--cc-text-primary)]"
                }`}
                id={`navbar-link-${label.toLowerCase()}`}
              >
                <Icon size={16} />
                <span className="hidden md:inline">{label}</span>
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
            {wallet && (
              <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono text-[var(--cc-text-secondary)]">
                <span className="flex items-center gap-1">
                  <Coins size={13} className="text-amber-500" /> {wallet.gold.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles size={13} className="text-purple-400" /> {wallet.aetherium.toLocaleString()}
                </span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md transition-colors text-[var(--cc-text-secondary)] hover:text-[var(--cc-green)] hover:bg-[var(--cc-bg-hover)]"
              title="Friends"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setIsShopOpen(true)}
              className="p-1.5 rounded-md transition-colors text-[var(--cc-text-secondary)] hover:text-[var(--cc-green)] hover:bg-[var(--cc-bg-hover)]"
              title="Shop"
            >
              <Store size={20} />
            </button>
            <button
              onClick={() => setIsInventoryOpen(true)}
              className="p-1.5 rounded-md transition-colors text-[var(--cc-text-secondary)] hover:text-[var(--cc-green)] hover:bg-[var(--cc-bg-hover)]"
              title="Inventory"
            >
              <Package size={20} />
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

      {isInventoryOpen && (
        <InventoryModal onClose={() => { setIsInventoryOpen(false); refreshWallet(); }} />
      )}
      {isShopOpen && (
        <ShopModal onClose={() => { setIsShopOpen(false); refreshWallet(); }} />
      )}
    </nav>
  );
}
