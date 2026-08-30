"use client";

import Link from "next/link";
import { BlurText } from "@/components/react-bits";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  /** Page title, revealed with a soft blur-in on mount. */
  title: string;
  /** Where the back link goes. */
  backHref: string;
  backLabel?: string;
  className?: string;
  /** Matches each page's own content width so the header lines up with what's below it. */
  maxWidthClassName?: string;
}

/**
 * The "← back link, centered title" header that used to be hand-retyped in
 * Rated/Daily/Survival/Custom Puzzles and both Learn sub-pages — six copies
 * of the same 8 lines. One component now; the title gets a BlurText reveal
 * instead of appearing instantly.
 */
export function PageHeader({
  title,
  backHref,
  backLabel = "Back",
  className,
  maxWidthClassName = "max-w-[1100px]",
}: PageHeaderProps) {
  return (
    <div className={cn("flex w-full items-center justify-between px-4 mb-4", maxWidthClassName, className)}>
      <Link
        href={backHref}
        className="text-sm font-semibold text-cc-text-secondary transition-colors hover:text-cc-text-primary"
      >
        &larr; {backLabel}
      </Link>
      <BlurText
        text={title}
        animateBy="words"
        direction="top"
        delay={70}
        stepDuration={0.3}
        className="text-xl font-bold font-serif text-cc-text-primary"
      />
    </div>
  );
}
