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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--cc-bg-sidebar)]">
      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--cc-green)] shadow-[0_4px_0_var(--cc-green-dark)]">
              <span className="text-2xl text-white font-bold">♔</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--cc-text-primary)]">
              {title}
            </h1>
          </div>
          <p className="text-sm mt-1 text-[var(--cc-text-secondary)]">{subtitle}</p>
        </div>

        <div className="rounded-2xl border p-8 bg-[var(--cc-bg-card)] border-[var(--cc-border)]">
          {children}
        </div>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
