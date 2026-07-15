import React from "react";

export interface SelectableCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  children: React.ReactNode;
}

export function SelectableCard({ isActive, children, className = "", ...rest }: SelectableCardProps) {
  return (
    <button
      className={`
        border transition-all cursor-pointer shadow-sm
        ${isActive 
          ? "bg-cc-bg-hover border-cc-green text-cc-text-primary" 
          : "bg-cc-bg-input border-transparent text-cc-text-secondary hover:bg-cc-bg-hover"
        }
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
}
