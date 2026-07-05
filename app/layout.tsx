import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Arena",
  description: "Play, practice, and explore chess components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-zinc-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
