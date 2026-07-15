"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/Spinner";

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
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <span className="text-xs font-serif font-extrabold text-cc-text-primary/80 tracking-wide uppercase">
          Redirecting to Profile...
        </span>
      </div>
    </main>
  );
}
