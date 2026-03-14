"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Shield } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { appMeta } from "@/lib/constants";
import { createBrowserClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";

function getNextPath(rawValue: string | null): string {
  if (rawValue && rawValue.startsWith("/")) {
    return rawValue;
  }

  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setAuthError("Invalid credentials. Please try again.");
        return;
      }

      const nextPath = getNextPath(searchParams.get("next"));
      startTransition(() => {
        router.replace(nextPath);
        router.refresh();
      });
    } catch {
      setAuthError("Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.9),transparent_45%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-300">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">
              {appMeta.name}
            </p>
            <p className="mt-1 text-sm text-slate-400">{appMeta.subtitle}</p>
          </div>
        </div>

        <div className="mt-10">
          <h1 className="text-3xl font-semibold text-white">Secure Login</h1>
          <p className="mt-3 text-sm text-slate-400">
            Invite-only access for plant security teams and incident responders.
          </p>
        </div>

        <form className="mt-8 space-y-5" noValidate onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-200">
            Email
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              placeholder="admin@cyberguard.test"
              type="email"
              {...register("email")}
            />
            {errors.email ? (
              <span className="mt-2 block text-xs text-red-300">{errors.email.message}</span>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              placeholder="********"
              type="password"
              {...register("password")}
            />
            {errors.password ? (
              <span className="mt-2 block text-xs text-red-300">
                {errors.password.message}
              </span>
            ) : null}
          </label>

          {authError ? (
            <div
              aria-live="polite"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {authError}
            </div>
          ) : null}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-500/60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "Signing in..." : "Secure Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
