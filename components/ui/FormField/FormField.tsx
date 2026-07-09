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
        className="block text-sm font-medium text-[#b3b3b0]"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        ref={ref}
        className={`w-full bg-[#262421] border ${
          error
            ? "border-red-500/50 focus:ring-red-500"
            : "border-[#3d3a36] focus:ring-[#81b64c]"
        } rounded-xl px-4 py-3 text-white placeholder-[#6e6c68] text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${className}`}
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
