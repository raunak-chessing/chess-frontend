"use client";

import { BlurText, FadeContent } from "@/components/react-bits";

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 bg-[var(--cc-bg-sidebar)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-3xl bg-[var(--cc-green)]/5" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-3xl bg-[var(--cc-accent-gold)]/5" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--cc-green)] shadow-[0_4px_0_var(--cc-green-dark)]">
              <span className="text-2xl text-white font-bold">♔</span>
            </div>
            <BlurText
              text={title}
              animateBy="words"
              direction="top"
              className="text-3xl font-bold tracking-tight text-[var(--cc-text-primary)]"
            />
          </div>
          <p className="text-sm mt-1 text-[var(--cc-text-secondary)]">{subtitle}</p>
        </div>

        <FadeContent duration={500} initialOpacity={0} className="rounded-2xl border p-8 bg-[var(--cc-bg-card)] border-[var(--cc-border)]">
          {children}
        </FadeContent>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
