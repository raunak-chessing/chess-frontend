import React from "react";
import type { FormFieldProps } from "./FormField.types";

export default function FormField({
  id,
  label,
  type = "text",
  error,
  className = "",
  ref,
  ...rest
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-cc-text-muted"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all shadow-sm
            bg-[var(--cc-bg-input)] text-[var(--cc-text-primary)]
            ${
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-[var(--cc-border)] focus:border-[var(--cc-green)] focus:ring-1 focus:ring-[var(--cc-green)] hover:border-[var(--cc-border-light)]"
            } ${className}
          `}
        {...rest}
      />
      {error && (
        <span className="text-xs text-red-400" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
