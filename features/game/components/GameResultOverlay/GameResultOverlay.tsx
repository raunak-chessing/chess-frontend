import React from "react";

export interface GameResultOverlayConfig {
  title: string;
  description: string;
  bgClass: string;
  buttonClass: string;
}

export interface GameResultOverlayProps {
  config: GameResultOverlayConfig | null;
  onDismiss: () => void;
}

export function GameResultOverlay({ config, onDismiss }: GameResultOverlayProps) {
  if (!config) return null;

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-cc-border-light backdrop-blur-md transition-all duration-300 z-30 ${config.bgClass}`}
    >
      <h2 className="text-3xl font-extrabold mb-2 tracking-tight">
        {config.title}
      </h2>
      <p className="opacity-90 font-medium mb-6">{config.description}</p>
      <button
        onClick={onDismiss}
        className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-md cursor-pointer transition-colors ${config.buttonClass}`}
      >
        Close Overlay
      </button>
    </div>
  );
}
