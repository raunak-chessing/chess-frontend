"use client";

import { Spinner } from "@/components/ui/Spinner";
import { FadeContent } from "@/components/react-bits";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  /** Optional caption under the spinner, e.g. "Loading tournaments...". */
  label?: string;
  /** "inline" sits in normal flow; "fill" centers in a full-height container. */
  variant?: "inline" | "fill";
  className?: string;
}

/**
 * The one loading indicator for the app. Before this, the same idea had five
 * different implementations across the codebase (a Loader2 icon spin, a
 * hand-built spinning-border div, plain centered text — twice, differently —
 * and this Spinner component). One component, wrapped in a soft fade-in
 * instead of popping onto the screen.
 */
export function LoadingState({ label, variant = "inline", className }: LoadingStateProps) {
  return (
    <FadeContent duration={220} initialOpacity={0} threshold={0}>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 text-cc-text-secondary",
          variant === "fill" && "h-[calc(100vh-80px)]",
          variant === "inline" && "py-16",
          className,
        )}
      >
        <Spinner size="lg" className="text-cc-green" />
        {label ? <p className="text-sm font-medium">{label}</p> : null}
      </div>
    </FadeContent>
  );
}
