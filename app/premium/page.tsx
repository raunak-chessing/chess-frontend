"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Crown, Shield, Zap, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import toast from "react-hot-toast";
import { z } from "zod";

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
    { icon: <Crown className="text-yellow-500" />, title: "Premium Badge", desc: "Stand out in the arena with an exclusive diamond badge." },
    { icon: <Sparkles className="text-purple-400" />, title: "Unlimited Analysis", desc: "The Seer's Tale unlocked for every single game you play." },
    { icon: <Shield className="text-indigo-400" />, title: "Faction Boost", desc: "Contribute 2x points to your League Division." },
    { icon: <Zap className="text-blue-400" />, title: "No Ads", desc: "Enjoy a completely ad-free, uninterrupted experience." }
  ];

  return (
    <main className="min-h-screen bg-cc-bg-page flex items-center justify-center p-6 text-cc-text-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-5xl z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Pitch */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-serif text-white mb-4">
              Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Full Potential</span>
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
                  <h3 className="font-bold text-white text-sm">{f.title}</h3>
                  <p className="text-xs text-cc-text-muted mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pricing Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500/20 to-transparent w-full h-full pointer-events-none" />
          
          <div className="relative z-10 text-center space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Premium Pass</h2>
            
            <div className="flex justify-center items-end gap-1">
              <span className="text-5xl font-black text-amber-500">$9.99</span>
              <span className="text-slate-400 font-bold mb-1">/ month</span>
            </div>
            
            <ul className="text-left space-y-3 mx-auto max-w-xs pt-4">
              {['Cancel anytime', 'Instant activation', 'Secure Stripe checkout'].map((text, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> {text}
                </li>
              ))}
            </ul>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 mt-8 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] disabled:opacity-50"
            >
              {loading ? "Initializing..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
