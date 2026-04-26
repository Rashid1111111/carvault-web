"use client";

import { useState } from "react";
import { getAuthCallbackUrl } from "@/app/lib/authCallbackUrl";
import { createBrowserSupabaseClient } from "./supabase-client";
import { storePendingSignupRole } from "./ensureUserProfile";

type ErrorFields = {
  name: string;
  message: string;
  status: string | null;
  code: string | null;
  json: string;
};

function getErrorFields(e: unknown): ErrorFields {
  let name = "";
  let message = "";
  let status: string | null = null;
  let code: string | null = null;

  if (e instanceof Error) {
    name = e.name ?? "";
    message = e.message ?? "";
  }

  if (e && typeof e === "object") {
    const o = e as Record<string, unknown>;
    if (typeof o.name === "string") name = o.name;
    if (typeof o.message === "string") message = o.message;
    if (o.status !== undefined && o.status !== null) status = String(o.status);
    if (o.code !== undefined && o.code !== null) code = String(o.code);
  } else if (typeof e === "string") {
    name = "string";
    message = e;
  }

  if (!name) name = "(empty)";
  if (!message) message = "(empty)";

  let json: string;
  try {
    if (e && typeof e === "object" && e !== null) {
      json = JSON.stringify(e, Object.getOwnPropertyNames(e) as string[], 2);
    } else {
      json = JSON.stringify(e, null, 2);
    }
  } catch {
    try {
      json = JSON.stringify(String(e));
    } catch {
      json = String(e);
    }
  }

  return { name, message, status, code, json };
}

function maskSupabaseUrl(url: string): string {
  if (!url.trim()) return "(empty)";
  try {
    const u = new URL(url);
    const segs = u.hostname.split(".");
    if (segs.length >= 3 && u.hostname.endsWith("supabase.co")) {
      const sub = segs[0];
      const rest = segs.slice(1).join(".");
      const maskedSub = sub.length <= 2 ? "****" : `${sub.slice(0, 2)}****${sub.slice(-1)}`;
      u.hostname = `${maskedSub}.${rest}`;
    } else {
      u.hostname = "****" + u.hostname.slice(Math.min(4, u.hostname.length));
    }
    return u.toString();
  } catch {
    return url.length > 20 ? `${url.slice(0, 12)}…${url.slice(-6)}` : url;
  }
}

function logAuthFailure(context: string, err: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[CarVault auth] ${context}`, err);
    return;
  }
  if (err instanceof Error) {
    console.error(`[CarVault auth] ${context}`, err.name, err.message);
  } else {
    console.error(`[CarVault auth] ${context}`, getErrorFields(err).json);
  }
}

type AuthFailureState = {
  fields: ErrorFields;
  loadFailedExtras: { maskedSupabaseUrl: string; emailRedirectTo: string } | null;
  debug: {
    supabaseUrlPresent: boolean;
    anonKeyPresent: boolean;
    emailRedirectTo: string;
  };
};

type EmailOtpFormProps = {
  title: string;
  role?: string;
  ctaLabel: string;
  buttonClassName: string;
};

function buildDebugBlock(emailRedirectTo: string) {
  const supabaseUrlPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const anonKeyPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());
  return { supabaseUrlPresent, anonKeyPresent, emailRedirectTo };
}

export function EmailOtpForm({
  title,
  role,
  ctaLabel,
  buttonClassName,
}: EmailOtpFormProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authFailure, setAuthFailure] = useState<AuthFailureState | null>(null);

  async function onContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setAuthFailure(null);
    const emailRedirectTo = getAuthCallbackUrl();
    const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    const maskedUrl = maskSupabaseUrl(supabaseUrlRaw);

    const setFailure = (err: unknown) => {
      const fields = getErrorFields(err);
      const isLoadFailed = fields.message === "Load failed" || /load failed/i.test(fields.message);
      setAuthFailure({
        fields,
        loadFailedExtras: isLoadFailed
          ? { maskedSupabaseUrl: maskedUrl, emailRedirectTo }
          : null,
        debug: buildDebugBlock(emailRedirectTo),
      });
    };

    try {
      const supabase = createBrowserSupabaseClient();
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
        setFailure(signInError);
        logAuthFailure("signInWithOtp error object", signInError);
        return;
      }
      setSent(true);
    } catch (err) {
      setFailure(err);
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
        {authFailure ? (
          <div
            className="space-y-3 rounded-lg border border-red-400/30 bg-red-950/20 p-3 text-left"
            role="alert"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-red-200/80">Auth error</p>
            <pre className="whitespace-pre-wrap break-all text-xs text-red-100/95">
              {`name: ${authFailure.fields.name}
message: ${authFailure.fields.message}
status: ${authFailure.fields.status ?? "(not set)"}
code: ${authFailure.fields.code ?? "(not set)"}
json:
${authFailure.fields.json}`}
            </pre>
            {authFailure.loadFailedExtras ? (
              <div className="border-t border-red-400/20 pt-3 text-xs text-red-100/90">
                <p className="mb-1 font-medium text-red-200/90">“Load failed” context</p>
                <p className="break-all">Supabase URL (masked): {authFailure.loadFailedExtras.maskedSupabaseUrl}</p>
                <p className="mt-1 break-all">emailRedirectTo: {authFailure.loadFailedExtras.emailRedirectTo}</p>
              </div>
            ) : null}
            <div className="border-t border-amber-500/30 pt-3 text-xs text-amber-100/90">
              <p className="mb-1 font-semibold text-amber-200">Temporary diagnostic (remove later)</p>
              <p>NEXT_PUBLIC_SUPABASE_URL present? {authFailure.debug.supabaseUrlPresent ? "yes" : "no"}</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY present? {authFailure.debug.anonKeyPresent ? "yes" : "no"}</p>
              <p className="mt-1 break-all">emailRedirectTo: {authFailure.debug.emailRedirectTo}</p>
            </div>
          </div>
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
