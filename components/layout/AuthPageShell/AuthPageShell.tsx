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
    <div className="min-h-screen flex items-center justify-center bg-[#262421] px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-green-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#81b64c] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/30">
              <span className="text-2xl text-white font-bold">♔</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {title}
            </h1>
          </div>
          <p className="text-[#a3a3a0] text-sm mt-1">{subtitle}</p>
        </div>

        <div className="bg-[#312e2b] rounded-2xl border border-[#3d3a36] shadow-2xl shadow-black/40 p-8">
          {children}
        </div>

        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
