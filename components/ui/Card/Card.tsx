import React from "react";
import { SpotlightCard } from "@/components/react-bits";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Adds a cursor-tracking spotlight glow on hover/focus (via React Bits'
   * SpotlightCard). Off by default so every existing call site is unchanged —
   * opt a card into it deliberately, for surfaces the user actually hovers
   * as a choice (option grids, profile widgets), not everywhere at once.
   */
  interactive?: boolean;
  /** Only used when `interactive` is true. */
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

const SHELL_CLASSES = "bg-cc-bg-card border-cc-border border rounded-2xl shadow-xl p-4 md:p-6";

export function Card({
  children,
  className = "",
  interactive = false,
  spotlightColor = "rgba(129, 182, 76, 0.18)", // --cc-green, low opacity
  ...rest
}: CardProps) {
  if (interactive) {
    return (
      <SpotlightCard
        className={cn(SHELL_CLASSES, "transition-colors duration-200 hover:border-cc-border-light", className)}
        spotlightColor={spotlightColor}
        {...rest}
      >
        {children}
      </SpotlightCard>
    );
  }

  return (
    <div className={cn(SHELL_CLASSES, className)} {...rest}>
      {children}
    </div>
  );
}
