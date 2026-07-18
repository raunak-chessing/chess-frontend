import React from "react";
import { X, Check, Loader2 } from "lucide-react";

interface ConsentDialogProps {
  type: "undo" | "rematch" | null;
  isPending: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onCancel?: () => void; // For canceling our own request
}

export function ConsentDialog({ type, isPending, onAccept, onDecline, onCancel }: ConsentDialogProps) {
  if (!type) return null;

  const title = type === "undo" ? "Takeback Request" : "Rematch Request";
  const descPending = `Waiting for opponent to accept your ${type} request...`;
  const descRequest = `Your opponent requested a ${type}.`;

  return (
    <div className="absolute top-4 right-4 z-50 flex flex-col items-center bg-cc-bg-card border border-cc-border p-4 rounded-xl shadow-2xl animate-in slide-in-from-top fade-in duration-300 w-72">
      <h3 className="font-bold text-cc-text-primary text-sm tracking-widest uppercase mb-2">{title}</h3>
      <p className="text-xs text-cc-text-secondary text-center mb-4">
        {isPending ? descPending : descRequest}
      </p>
      
      {isPending ? (
        <div className="flex gap-2 w-full">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-2 bg-red-900/40 text-red-400 font-bold text-xs rounded-lg hover:bg-red-900/60 transition-colors flex items-center justify-center gap-2"
            >
              Cancel Request
            </button>
          )}
          <div className="py-2 px-3 text-cc-text-secondary flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        </div>
      ) : (
        <div className="flex gap-2 w-full">
          <button
            onClick={onDecline}
            className="flex-1 py-2 bg-red-900/40 text-red-400 font-bold text-xs rounded-lg hover:bg-red-900/60 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2 bg-emerald-900/40 text-emerald-400 font-bold text-xs rounded-lg hover:bg-emerald-900/60 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Accept
          </button>
        </div>
      )}
    </div>
  );
}
