"use client";

import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { House, Lightning, PuzzlePiece, Trophy, BookOpen, GraduationCap, Users, Package, Storefront, Coins, Sparkle, List, X } from "@phosphor-icons/react";
import { useSocialStore } from "@/features/social/store/socialStore";
import { InventoryModal } from "@/features/inventory/components";
import { ShopModal } from "@/features/shop/components/ShopModal/ShopModal";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { useEffect, useState, useCallback, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const NAV_LINKS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/play", label: "Play", Icon: Lightning },
  { href: "/puzzles", label: "Puzzles", Icon: PuzzlePiece },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linksContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const mobileLinksRef = useRef<HTMLDivElement>(null);

  const refreshWallet = useCallback(() => {
    if (!session) return;
    inventoryApi.getMyInventory()
      .then((inv) => setWallet({ gold: inv.gold, aetherium: inv.aetherium }))
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  // Close the mobile drawer on every navigation.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

  // Staggered mask reveal for the mobile overlay's links + session section.
  useGSAP(
    () => {
      if (!isMobileMenuOpen || !mobileLinksRef.current) return;
      const items = mobileLinksRef.current.querySelectorAll("[data-mobile-reveal]");
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        gsap.set(items, { y: 0, opacity: 1 });
        return;
      }

      gsap.fromTo(
        items,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out" },
      );
    },
    { dependencies: [isMobileMenuOpen], scope: mobileLinksRef },
  );

  return (
    <nav className="sticky top-4 z-50 mx-4 md:mx-6 flex items-center justify-between gap-6 px-4 md:px-6 h-14 rounded-full bg-cc-bg-card/95 backdrop-blur-xl ring-1 ring-cc-border shadow-[0_8px_30px_rgba(43,36,32,0.08)]">
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 cursor-pointer group"
          id="navbar-logo"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 bg-cc-green">
            <span className="text-white font-bold text-base leading-none">♔</span>
          </div>
          <span className="font-serif font-bold text-base tracking-tight hidden sm:inline text-cc-text-primary">
            Chess Arena
          </span>
        </button>

        <div ref={linksContainerRef} className="relative hidden md:flex items-center gap-1">
          <span
            ref={indicatorRef}
            className="absolute left-0 top-0 h-full rounded-full bg-cc-bg-hover opacity-0"
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
                className={`relative px-3 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  active ? "text-cc-green" : "text-cc-text-secondary hover:text-cc-text-primary"
                }`}
                style={{ transitionTimingFunction: "var(--ease-spring)" }}
                id={`navbar-link-${label.toLowerCase()}`}
              >
                <Icon size={16} />
                <span className="hidden lg:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full transition-colors text-cc-text-secondary hover:text-cc-text-primary hover:bg-cc-bg-hover"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
        id="navbar-mobile-toggle"
      >
        <List
          size={22}
          className="absolute transition-all duration-300"
          style={{
            transitionTimingFunction: "var(--ease-spring)",
            opacity: isMobileMenuOpen ? 0 : 1,
            transform: isMobileMenuOpen ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
          }}
        />
        <X
          size={22}
          className="absolute transition-all duration-300"
          style={{
            transitionTimingFunction: "var(--ease-spring)",
            opacity: isMobileMenuOpen ? 1 : 0,
            transform: isMobileMenuOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
          }}
        />
      </button>

      <div className="hidden md:flex items-center gap-3">
        {isPending ? (
          <div className="h-8 w-20 rounded-full animate-pulse bg-cc-bg-input" />
        ) : session ? (
          <div className="flex items-center gap-3">
            {wallet && (
              <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono text-cc-text-secondary">
                <span className="flex items-center gap-1">
                  <Coins size={13} className="text-cc-accent-gold" /> {wallet.gold.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkle size={13} className="text-cc-accent-blue" /> {wallet.aetherium.toLocaleString()}
                </span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-full transition-colors text-cc-text-secondary hover:text-cc-green hover:bg-cc-bg-hover"
              title="Friends"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setIsShopOpen(true)}
              className="p-1.5 rounded-full transition-colors text-cc-text-secondary hover:text-cc-green hover:bg-cc-bg-hover"
              title="Shop"
            >
              <Storefront size={20} />
            </button>
            <button
              onClick={() => setIsInventoryOpen(true)}
              className="p-1.5 rounded-full transition-colors text-cc-text-secondary hover:text-cc-green hover:bg-cc-bg-hover"
              title="Inventory"
            >
              <Package size={20} />
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 rounded-full transition-colors bg-transparent hover:bg-cc-bg-hover"
              id="navbar-profile"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-7 h-7 rounded-full border border-cc-border-light"
                />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-cc-green text-white">
                  {(session.user.name || "U")[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold hidden sm:inline group-hover:opacity-80 transition-opacity text-cc-text-primary">
                {session.user.name}
              </span>
            </button>
            <button
              onClick={async () => {
                await authClient.signOut();
                router.refresh();
              }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border bg-transparent hover:bg-cc-bg-hover border-cc-border hover:border-cc-border-light text-cc-text-secondary"
              id="navbar-logout"
            >
              Log Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/login")}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer bg-transparent hover:bg-cc-bg-hover text-cc-text-secondary"
              id="navbar-login"
            >
              Log In
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="group px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm bg-cc-green hover:bg-cc-green-hover text-white active:scale-[0.98]"
              style={{ transitionTimingFunction: "var(--ease-spring)" }}
              id="navbar-signup"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-19 z-40 bg-cc-text-primary/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={mobileLinksRef}
            className="md:hidden fixed inset-x-4 top-19 z-40 flex flex-col gap-1 p-3 rounded-3xl shadow-2xl bg-cc-bg-card/98 backdrop-blur-2xl ring-1 ring-cc-border"
          >
            {NAV_LINKS.map(({ href, label, Icon }) => {
              const active = isExactActiveLink(pathname, href);
              return (
                <button
                  key={href}
                  data-mobile-reveal
                  onClick={() => router.push(href)}
                  className={`w-full px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-3 ${
                    active
                      ? "text-cc-green bg-cc-bg-hover"
                      : "text-cc-text-secondary hover:text-cc-text-primary hover:bg-cc-bg-hover"
                  }`}
                  id={`navbar-mobile-link-${label.toLowerCase()}`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              );
            })}

            <div className="my-2 border-t border-cc-border" data-mobile-reveal />

            {isPending ? (
              <div className="h-9 w-full rounded-full animate-pulse bg-cc-bg-input" data-mobile-reveal />
            ) : session ? (
              <>
                {wallet && (
                  <div className="flex items-center gap-4 px-3 py-2 text-sm font-mono text-cc-text-secondary" data-mobile-reveal>
                    <span className="flex items-center gap-1.5">
                      <Coins size={14} className="text-cc-accent-gold" /> {wallet.gold.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sparkle size={14} className="text-cc-accent-blue" /> {wallet.aetherium.toLocaleString()}
                    </span>
                  </div>
                )}
                <button
                  data-mobile-reveal
                  onClick={toggleSidebar}
                  className="w-full px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-3 text-cc-text-secondary hover:text-cc-text-primary hover:bg-cc-bg-hover"
                >
                  <Users size={18} /> Friends
                </button>
                <button
                  data-mobile-reveal
                  onClick={() => setIsShopOpen(true)}
                  className="w-full px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-3 text-cc-text-secondary hover:text-cc-text-primary hover:bg-cc-bg-hover"
                >
                  <Storefront size={18} /> Shop
                </button>
                <button
                  data-mobile-reveal
                  onClick={() => setIsInventoryOpen(true)}
                  className="w-full px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-3 text-cc-text-secondary hover:text-cc-text-primary hover:bg-cc-bg-hover"
                >
                  <Package size={18} /> Inventory
                </button>
                <button
                  data-mobile-reveal
                  onClick={() => router.push("/profile")}
                  className="w-full px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-3 text-cc-text-secondary hover:text-cc-text-primary hover:bg-cc-bg-hover"
                  id="navbar-mobile-profile"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-6 h-6 rounded-full border border-cc-border-light"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-cc-green text-white">
                      {(session.user.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  {session.user.name}
                </button>
                <button
                  data-mobile-reveal
                  onClick={async () => {
                    await authClient.signOut();
                    router.refresh();
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-3 text-cc-text-secondary hover:text-cc-text-primary hover:bg-cc-bg-hover"
                  id="navbar-mobile-logout"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-1" data-mobile-reveal>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer bg-transparent border border-cc-border hover:bg-cc-bg-hover text-cc-text-secondary"
                  id="navbar-mobile-login"
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer bg-cc-green hover:bg-cc-green-hover text-white"
                  id="navbar-mobile-signup"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {isInventoryOpen && (
        <InventoryModal onClose={() => { setIsInventoryOpen(false); refreshWallet(); }} />
      )}
      {isShopOpen && (
        <ShopModal onClose={() => { setIsShopOpen(false); refreshWallet(); }} />
      )}
    </nav>
  );
}
