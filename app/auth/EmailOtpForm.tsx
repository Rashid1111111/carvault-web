"use client";

import { useState } from "react";
import { getAuthCallbackUrl } from "@/app/lib/authCallbackUrl";
import { createBrowserSupabaseClient } from "./supabase-client";
import { storePendingSignupRole } from "./ensureUserProfile";

function formatCaughtError(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message?.trim();
    if (m) {
      if (m === "Load failed") {
        return "Load failed (network or CORS). Check the Supabase project URL, that this site is allowed, and that Redirect URLs include your callback.";
      }
      return m;
    }
    if (err.name) return err.name;
  }
  if (typeof err === "string" && err.trim()) return err.trim();
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m.trim();
  }
  try {
    const s = JSON.stringify(err);
    if (s && s !== "{}") return s;
  } catch {
    /* fall through */
  }
  return String(err);
}

function logAuthFailure(context: string, err: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[CarVault auth] ${context}`, err);
    return;
  }
  if (err instanceof Error) {
    console.error(`[CarVault auth] ${context}`, err.name, err.message);
  } else {
    console.error(`[CarVault auth] ${context}`, formatCaughtError(err));
  }
}

type EmailOtpFormProps = {
  /** Shown on the card */
  title: string;
  /** When set (e.g. from signup `?role=`), shown in the card */
  role?: string;
  ctaLabel: string;
  buttonClassName: string;
};

export function EmailOtpForm({
  title,
  role,
  ctaLabel,
  buttonClassName,
}: EmailOtpFormProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createBrowserSupabaseClient();
      const emailRedirectTo = getAuthCallbackUrl();
      if (role) {
        storePendingSignupRole(role);
      }
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo,
          ...(role ? { data: { role } } : {}),
        },
      });
      if (signInError) {
        const msg =
          (typeof signInError.message === "string" && signInError.message.trim()
            ? signInError.message
            : null) ?? formatCaughtError(signInError);
        setError(msg);
        logAuthFailure("signInWithOtp error object", signInError);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(formatCaughtError(err));
      logAuthFailure("signInWithOtp threw", err);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur-sm">
        <h1 className="text-lg font-semibold tracking-tight text-white">
          Check your email to continue
        </h1>
        <p className="mt-2 text-sm text-white/60">
          We sent a sign-in link to <span className="text-white/90">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8">
      <h1 className="text-center text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {title}
      </h1>
      {role ? (
        <p className="mt-1 text-center text-sm text-white/50">Role: {role}</p>
      ) : null}
      <form onSubmit={onContinue} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full min-h-[3rem] rounded-xl border border-white/15 bg-white/5 px-4 text-base text-white placeholder:text-white/35 outline-none ring-0 transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/25"
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>
        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className={buttonClassName}
          disabled={loading || !email.trim()}
        >
          {loading ? "Sending…" : ctaLabel}
        </button>
      </form>
    </div>
  );
}
