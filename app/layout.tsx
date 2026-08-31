import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { IconThemeProvider } from "@/components/IconThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";
import { FriendsSidebar } from "@/features/social/components/FriendsSidebar/FriendsSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ColosseumModal } from "@/features/social/components/ColosseumModal";

import { GlobalChatWidget } from "@/features/social/components/GlobalChatWidget";
import { MessagesPanel } from "@/features/social/components/MessagesPanel/MessagesPanel";
import { cn } from "@/lib/utils";

const bodySans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const displaySerif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["opsz", "SOFT", "WONK"],
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
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-sans", bodySans.variable, displaySerif.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground" suppressHydrationWarning>
        <IconThemeProvider>
          {/* Fixed film-grain texture — never attached to a scrolling container. */}
          <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-multiply" aria-hidden="true">
            <svg className="h-full w-full">
              <filter id="grain-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
              </filter>
              <rect width="100%" height="100%" filter="url(#grain-noise)" />
            </svg>
          </div>

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
        </IconThemeProvider>
      </body>
    </html>
  );
}
