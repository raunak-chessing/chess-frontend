"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoadingState } from "@/components/ui/LoadingState";

export default function SelfProfileRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      if (session?.user?.id) {
        router.replace(`/profile/${session.user.id}`);
      } else {
        router.replace("/login");
      }
    }
  }, [session, isPending, router]);

  return (
    <main className="min-h-screen bg-cc-bg-page flex items-center justify-center p-6 text-cc-text-primary">
      <LoadingState label="Redirecting to profile…" />
    </main>
  );
}
