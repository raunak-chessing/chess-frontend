"use client";

import { Spinner } from "../Spinner";
import type { ButtonProps } from "./Button.types";

const VARIANT_CLASSES = {
  primary:
    "bg-[#81b64c] hover:bg-[#6fa33f] disabled:bg-[#81b64c]/50 text-white shadow-lg shadow-green-900/20",
  secondary:
    "bg-[#262421] hover:bg-[#2c2a27] border border-[#3d3a36] hover:border-zinc-500 text-white",
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
        font-semibold rounded-xl transition-all duration-200 text-sm cursor-pointer
        disabled:cursor-not-allowed
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
