import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`bg-cc-bg-card border-cc-border border rounded-2xl shadow-xl p-4 md:p-6 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
