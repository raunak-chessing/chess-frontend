"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthPageShell } from "@/components/layout/AuthPageShell";
import { OAuthButtons } from "../OAuthButtons/OAuthButtons";
import { signupSchema } from "../../schemas/auth.schemas";
import type { SignupInput } from "../../types/auth.types";

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        setError(result.error.message ?? "Signup failed. Please try again.");
        return;
      }

      await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "email-verification",
      });

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const footerLink = (
    <p className="text-center text-sm text-cc-text-muted">
      Already have an account?{" "}
      <Link
        href="/login"
        className="text-cc-green hover:text-cc-green-hover font-medium transition-colors"
        id="signup-login-link"
      >
        Log in
      </Link>
    </p>
  );

  return (
    <AuthPageShell
      title="Chess Arena"
      subtitle="Create your account"
      footer={footerLink}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="signup-form">
        <Alert variant="error" message={error} id="signup-error" />

        <FormField
          id="signup-name"
          label="Username"
          type="text"
          placeholder="GrandMaster42"
          error={errors.name?.message}
          {...register("name")}
        />

        <FormField
          id="signup-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          id="signup-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <FormField
          id="signup-confirm-password"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={loading} fullWidth id="signup-submit" className="mt-2">
          Sign Up
        </Button>

        <OAuthButtons idPrefix="signup" />
      </form>
    </AuthPageShell>
  );
}
