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
import { loginSchema } from "../../schemas/auth.schemas";
import type { LoginInput } from "../../types/auth.types";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        setError(result.error.message ?? "Login failed. Please try again.");
        return;
      }

      router.push("/");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const footerLink = (
    <p className="text-center text-sm text-cc-text-muted">
      Don&apos;t have an account?{" "}
      <Link
        href="/signup"
        className="text-cc-green hover:text-cc-green-hover font-medium transition-colors"
        id="login-signup-link"
      >
        Sign up
      </Link>
    </p>
  );

  return (
    <AuthPageShell
      title="Chess Arena"
      subtitle="Sign in to your account"
      footer={footerLink}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
        <Alert variant="error" message={error} id="login-error" />

        <FormField
          id="login-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          id="login-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" loading={loading} fullWidth id="login-submit">
          Log In
        </Button>

        <OAuthButtons idPrefix="login" />
      </form>
    </AuthPageShell>
  );
}
