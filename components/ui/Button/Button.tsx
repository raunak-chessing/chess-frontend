"use client";

import { Spinner } from "../Spinner";
import type { ButtonProps } from "./Button.types";

const VARIANT_CLASSES = {
  primary:
    "bg-[var(--cc-green)] hover:bg-[var(--cc-green-hover)] text-white shadow-[0_4px_0_var(--cc-green-dark)] active:translate-y-[4px] active:shadow-none border border-transparent",
  secondary:
    "bg-[var(--cc-bg-input)] hover:bg-[var(--cc-bg-hover)] border border-[var(--cc-border)] hover:border-[var(--cc-border-light)] text-[var(--cc-text-primary)]",
  ghost:
    "bg-transparent hover:bg-zinc-800/40 border border-transparent text-zinc-300",
} as const;

export default function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        font-bold rounded-xl transition-all duration-200 text-sm cursor-pointer px-4 py-3
        disabled:cursor-not-allowed disabled:opacity-50
        ${fullWidth ? "w-full" : ""}
        ${VARIANT_CLASSES[variant]}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner size="sm" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
