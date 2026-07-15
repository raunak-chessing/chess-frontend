"use client";

import { useState, useRef, useEffect, Suspense, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/Spinner";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp: code,
      });

      if (result.error) {
        setError(result.error.message ?? "Verification failed. Please try again.");
        return;
      }

      setSuccess("Email verified successfully! Redirecting…");
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setResendLoading(true);
    setError("");

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      setSuccess("A new code has been sent to your email.");
      setResendCooldown(60);
    } catch {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cc-bg-sidebar px-4">
        <div className="text-center">
          <p className="text-cc-text-secondary text-sm mb-4">No email address provided.</p>
          <a
            href="/signup"
            className="text-cc-green hover:text-cc-green-hover font-medium text-sm"
          >
            Go to Sign Up
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cc-bg-sidebar px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cc-green/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cc-green/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-cc-green rounded-xl flex items-center justify-center shadow-lg shadow-green-900/30">
              <span className="text-2xl text-white font-bold">♔</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Chess Arena
            </h1>
          </div>
          <p className="text-cc-text-secondary text-sm mt-1">Verify your email address</p>
        </div>

        <div className="bg-cc-bg-card rounded-2xl border border-cc-border shadow-2xl shadow-black/40 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cc-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-cc-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <p className="text-cc-text-muted text-sm">
              We sent a 6-digit code to
            </p>
            <p className="text-white font-medium text-sm mt-1">{email}</p>
          </div>

          <form onSubmit={handleSubmit} id="verify-form">
            {error && (
              <div
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4"
                id="verify-error"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl mb-4"
                id="verify-success"
              >
                {success}
              </div>
            )}

            <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  id={`otp-input-${index}`}
                  className="w-12 h-14 bg-cc-bg-sidebar border border-cc-border rounded-xl text-center text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cc-green focus:border-transparent transition-all duration-200"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              id="verify-submit"
              className="w-full bg-cc-green hover:bg-cc-green-hover disabled:bg-cc-green/50 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-green-900/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size="sm" />
                  Verifying…
                </span>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendLoading}
              id="verify-resend"
              className="text-sm text-cc-text-secondary hover:text-cc-green disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {resendLoading
                ? "Sending…"
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Didn\u2019t receive a code? Resend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cc-bg-sidebar">
          <Spinner />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
