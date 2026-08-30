"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export type OptionAccent = "green" | "amber" | "blue" | "purple" | "pink" | "red";

const ACCENT_STYLES: Record<OptionAccent, { chipBg: string; iconText: string; hoverBorder: string; spotlight: `rgba(${number}, ${number}, ${number}, ${number})` }> = {
  green: { chipBg: "bg-cc-green/15", iconText: "text-cc-green", hoverBorder: "hover:border-cc-green", spotlight: "rgba(129, 182, 76, 0.35)" },
  amber: { chipBg: "bg-amber-500/15", iconText: "text-amber-500", hoverBorder: "hover:border-amber-500", spotlight: "rgba(245, 158, 11, 0.35)" },
  blue: { chipBg: "bg-blue-500/15", iconText: "text-blue-500", hoverBorder: "hover:border-blue-500", spotlight: "rgba(59, 130, 246, 0.35)" },
  purple: { chipBg: "bg-purple-500/15", iconText: "text-purple-500", hoverBorder: "hover:border-purple-500", spotlight: "rgba(168, 85, 247, 0.35)" },
  pink: { chipBg: "bg-pink-500/15", iconText: "text-pink-500", hoverBorder: "hover:border-pink-500", spotlight: "rgba(236, 72, 153, 0.35)" },
  red: { chipBg: "bg-red-500/15", iconText: "text-red-500", hoverBorder: "hover:border-red-500", spotlight: "rgba(239, 68, 68, 0.35)" },
};

export interface OptionCardItem {
  href: string;
  Icon: LucideIcon;
  title: string;
  description: string;
  accent?: OptionAccent;
  badge?: string;
  /** Filled/highlighted treatment for the one option that deserves top billing. */
  primary?: boolean;
}

export interface OptionCardGridProps {
  items: OptionCardItem[];
  /** "row": full-width horizontal cards, single column (a short, ranked list of modes).
   *  "tile": a responsive grid of vertical icon-over-text cards (a hub of many equal options). */
  variant?: "row" | "tile";
  className?: string;
}

/**
 * The "icon + title + description" option card, previously hand-rolled
 * independently on the Play hub, the Puzzles hub, and the custom-puzzle
 * theme picker — three near-identical grids, only the colors and copy
 * differing. One component now, with a real cursor-tracking spotlight
 * instead of a flat hover:-translate-y-1.
 */
export function OptionCardGrid({ items, variant = "tile", className }: OptionCardGridProps) {
  return (
    <div
      className={cn(
        variant === "tile"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "flex flex-col gap-3",
        className,
      )}
    >
      {items.map((item) => (
        <OptionCard key={item.href} item={item} variant={variant} />
      ))}
    </div>
  );
}

function OptionCard({ item, variant }: { item: OptionCardItem; variant: "row" | "tile" }) {
  const { href, Icon, title, description, accent = "green", badge, primary } = item;
  const style = ACCENT_STYLES[accent];

  return (
    <Link href={href} className="block no-underline h-full">
      <Card
        interactive
        spotlightColor={primary ? "rgba(255, 255, 255, 0.25)" : style.spotlight}
        className={cn(
          "h-full transition-colors duration-200",
          variant === "tile" ? "flex flex-col items-start gap-4" : "flex items-center gap-4",
          primary ? "bg-cc-green border-cc-green text-white hover:bg-cc-green-hover" : style.hoverBorder,
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-xl shrink-0",
            variant === "tile" ? "w-12 h-12" : "w-11 h-11",
            primary ? "bg-white/15" : style.chipBg,
          )}
        >
          <Icon size={variant === "tile" ? 24 : 22} className={primary ? "text-white" : style.iconText} />
        </div>
        <div className={cn("flex flex-col gap-1", variant === "row" && "text-left")}>
          <span className={cn("font-bold font-serif leading-tight", variant === "tile" ? "text-lg" : "text-base")}>
            {title}
          </span>
          <span className={cn("text-xs leading-relaxed", primary ? "text-white/85" : "text-cc-text-secondary")}>
            {description}
          </span>
        </div>
        {badge && (
          <span className="ml-auto shrink-0 rounded-full border border-cc-accent-gold/30 bg-cc-accent-gold/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-cc-accent-gold">
            {badge}
          </span>
        )}
      </Card>
    </Link>
  );
}
