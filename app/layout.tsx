import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";
import { FriendsSidebar } from "@/features/social/components/FriendsSidebar/FriendsSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chess Arena",
  description: "Play, practice, and compete in chess online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans text-[var(--cc-text-primary)] bg-[var(--cc-bg-page)]" suppressHydrationWarning>
        <Toaster position="top-center" />
        <Navbar />
        <main className="flex-1 flex flex-col">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <FriendsSidebar />
      </body>
    </html>
  );
}
