import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";
import { FriendsSidebar } from "@/features/social/components/FriendsSidebar/FriendsSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ColosseumModal } from "@/features/social/components/ColosseumModal";

import { GlobalChatWidget } from "@/features/social/components/GlobalChatWidget";
import { MessagesPanel } from "@/features/social/components/MessagesPanel/MessagesPanel";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("h-full", "antialiased", inter.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans text-[var(--cc-text-primary)] bg-[var(--cc-bg-page)]" suppressHydrationWarning>
        <Toaster position="top-center" />
        <Navbar />
        <main className="flex-1 flex flex-col">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <FriendsSidebar />
        <ColosseumModal />
        <GlobalChatWidget />
        <MessagesPanel />
      </body>
    </html>
  );
}
