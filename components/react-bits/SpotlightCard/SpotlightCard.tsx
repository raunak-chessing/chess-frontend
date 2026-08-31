"use client";

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
  onMouseMove,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = e => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    onMouseMove?.(e);
  };

  const handleFocus: React.FocusEventHandler<HTMLDivElement> = e => {
    setIsFocused(true);
    setOpacity(0.6);
    onFocus?.(e);
  };

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = e => {
    setIsFocused(false);
    setOpacity(0);
    onBlur?.(e);
  };

  const handleMouseEnter: React.MouseEventHandler<HTMLDivElement> = e => {
    setOpacity(0.6);
    onMouseEnter?.(e);
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = e => {
    setOpacity(0);
    onMouseLeave?.(e);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn('relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8', className)}
      {...rest}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
