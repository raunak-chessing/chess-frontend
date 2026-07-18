"use client";

import { useEffect } from "react";

interface PlayErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PlayError({ error, reset }: PlayErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[PlayError]", error.message);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cc-bg-page text-cc-text-primary p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">♞</div>
        <h1 className="text-3xl font-bold font-serif tracking-tight">
          Game Error
        </h1>
        <p className="text-cc-text-secondary text-sm leading-relaxed">
          Something went wrong during your game. Your progress may have been saved automatically.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-xs text-left bg-cc-bg-sidebar border border-cc-border rounded-xl p-4 overflow-auto max-h-40 text-red-400">
            {error.message}
          </pre>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-cc-green hover:bg-cc-green-hover text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Resume Game
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-cc-bg-input hover:bg-cc-bg-hover text-cc-text-secondary font-bold rounded-xl transition-colors"
          >
            Return to Lobby
          </a>
        </div>
      </div>
    </div>
  );
}
