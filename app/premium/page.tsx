"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkle, Crown, Shield, Lightning, CheckCircle } from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import { z } from "zod";
import { BlurText, FadeContent } from "@/components/react-bits";

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetchApi(z.object({ url: z.string() }), "/api/payments/checkout", { method: "POST" });
      if (response.url) {
        window.location.href = response.url;
      } else {
        toast.error("Failed to start checkout");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
      setLoading(false);
    }
  };

  const features = [
    { icon: <Crown className="text-cc-accent-gold" />, title: "Premium Badge", desc: "Stand out in the arena with an exclusive diamond badge." },
    { icon: <Sparkle className="text-cc-accent-blue" />, title: "Unlimited Analysis", desc: "The Seer's Tale unlocked for every single game you play." },
    { icon: <Shield className="text-cc-green" />, title: "Faction Boost", desc: "Contribute 2x points to your League Division." },
    { icon: <Lightning className="text-cc-accent-red" />, title: "No Ads", desc: "Enjoy a completely ad-free, uninterrupted experience." }
  ];

  return (
    <main className="min-h-screen bg-cc-bg-page flex items-center justify-center p-6 text-cc-text-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cc-accent-gold/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Pitch */}
        <FadeContent duration={500} initialOpacity={0} threshold={0} className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-serif text-cc-text-primary mb-4">
              Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cc-accent-gold to-cc-green">Full Potential</span>
            </h1>
            <p className="text-lg text-cc-text-secondary">
              Join the elite ranks of Chess Arena Premium. Get advanced AI insights, support your faction, and conquer the leaderboards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="p-2 rounded-xl bg-cc-bg-sidebar border border-cc-border">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-cc-text-primary text-sm">{f.title}</h3>
                  <p className="text-xs text-cc-text-muted mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeContent>

        {/* Right Column: Pricing Card — deliberately dark, a spotlight moment
            against the light page (warm espresso, not a cold slate-grey). */}
        <FadeContent
          duration={500}
          delay={150}
          initialOpacity={0}
          threshold={0}
          className="bg-cc-text-primary border border-[#4a3d34] rounded-[1.75rem] p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-gradient-to-l from-[#96692a]/25 to-transparent w-full h-full pointer-events-none" />

          <div className="relative z-10 text-center space-y-6">
            <h2 className="text-2xl font-black font-serif text-cc-bg-page uppercase tracking-wider">Premium Pass</h2>

            <div className="flex justify-center items-end gap-1">
              <span className="text-5xl font-black text-[#e0a94f]">$9.99</span>
              <span className="text-cc-bg-page/60 font-bold mb-1">/ month</span>
            </div>

            <ul className="text-left space-y-3 mx-auto max-w-xs pt-4">
              {['Cancel anytime', 'Instant activation', 'Secure Stripe checkout'].map((text, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-cc-bg-page/80 font-medium">
                  <CheckCircle className="w-4 h-4 text-[#8fae7f]" /> {text}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 mt-8 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black uppercase tracking-widest rounded-full transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] disabled:opacity-50"
              style={{ transitionTimingFunction: "var(--ease-spring)" }}
            >
              {loading ? "Initializing..." : "Upgrade Now"}
            </button>
          </div>
        </FadeContent>
      </div>
    </main>
  );
}
