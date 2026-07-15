import React from "react";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function SectionHeader({ children, className = "", ...rest }: SectionHeaderProps) {
  return (
    <span
      className={`text-xs font-bold uppercase tracking-wider font-sans text-cc-text-secondary ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
