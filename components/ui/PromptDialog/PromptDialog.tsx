"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

export interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void | Promise<void>;
}

/**
 * Replaces `window.prompt()` — a single labeled text field behind a real
 * dialog, used everywhere a mode/study/chapter name is collected (arena
 * create, Swiss create, study create, chapter add).
 */
export function PromptDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  defaultValue = "",
  placeholder,
  confirmLabel = "Create",
  onConfirm,
}: PromptDialogProps) {
  const [value, setValue] = React.useState(defaultValue);
  const [submitting, setSubmitting] = React.useState(false);
  const inputId = React.useId();

  React.useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(trimmed);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-xs font-semibold text-cc-text-secondary">
              {label}
            </label>
            <input
              id={inputId}
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="rounded-lg border border-cc-border bg-cc-bg-page px-3 py-2 text-sm text-cc-text-primary outline-none focus:border-cc-green"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-cc-text-secondary hover:bg-cc-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim() || submitting}
              className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-cc-green hover:bg-cc-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : confirmLabel}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
