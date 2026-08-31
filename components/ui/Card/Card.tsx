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
  /**
   * Nests the card in a second, slightly larger frame (Double-Bezel) —
   * machined-hardware depth for a card that stands entirely on its own
   * (option tiles, auth panels). Off by default: `className` overrides
   * (custom gradients, radii) are meant to restyle the *whole* visible
   * surface, which only the single-shell form has — a bezelled card would
   * hide a caller's background behind the opaque inner core instead.
   */
  bezel?: boolean;
}

const SHELL_CLASSES = "bg-cc-bg-card border-cc-border border rounded-2xl shadow-xl p-4 md:p-6";

const BEZEL_OUTER = "bg-cc-bg-sidebar ring-1 ring-cc-border rounded-[1.75rem] p-1.5";
const BEZEL_INNER =
  "bg-cc-bg-card rounded-[1.375rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(43,36,32,0.05)] p-4 md:p-6";

export function Card({
  children,
  className = "",
  interactive = false,
  spotlightColor = "rgba(93, 112, 82, 0.18)", // --cc-green, low opacity
  bezel = false,
  ...rest
}: CardProps) {
  if (bezel) {
    const inner = (
      <div className={cn(BEZEL_INNER, "transition-colors duration-300 hover:ring-1 hover:ring-cc-border-light")} style={{ transitionTimingFunction: "var(--ease-spring)" }}>
        {children}
      </div>
    );
    return (
      <div className={cn(BEZEL_OUTER, className)} {...rest}>
        {interactive ? (
          <SpotlightCard className={cn(BEZEL_INNER)} spotlightColor={spotlightColor}>
            {children}
          </SpotlightCard>
        ) : (
          inner
        )}
      </div>
    );
  }

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
