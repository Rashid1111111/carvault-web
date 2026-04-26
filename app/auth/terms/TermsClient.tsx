"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  isSignupRole,
  SESSION_CHOSEN_ROLE_KEY,
  SESSION_TERMS_OK_KEY,
  SIGNUP_ROLE_LABEL,
  termsCopyForRole,
  type SignupRole,
} from "../signup-roles";

function TermsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") ?? "";
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!isSignupRole(roleParam)) {
      router.replace("/auth/choose-account");
    }
  }, [roleParam, router]);

  if (!isSignupRole(roleParam)) {
    return (
      <p className="text-center text-sm text-white/60" role="status">
        Redirecting…
      </p>
    );
  }

  const role: SignupRole = roleParam;

  function onContinue() {
    if (typeof window === "undefined" || !agreed) return;
    try {
      sessionStorage.setItem(SESSION_TERMS_OK_KEY, "1");
      sessionStorage.setItem(SESSION_CHOSEN_ROLE_KEY, role);
    } catch {
      /* ignore */
    }
    router.push(`/auth/signup?role=${encodeURIComponent(role)}`);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8">
      <h1 className="text-center text-xl font-semibold tracking-tight text-white sm:text-2xl">
        CarVault rules — {SIGNUP_ROLE_LABEL[role]}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-white/75">{termsCopyForRole(role)}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/55">
        By continuing, you also agree to use CarVault lawfully, keep your account secure, and follow any
        future updates we notify you about.
      </p>
      <label className="mt-6 flex cursor-pointer items-start gap-3 text-left text-sm text-white/90">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>I have read and agree to the terms above for this account type.</span>
      </label>
      <button
        type="button"
        className="mt-6 w-full min-h-12 rounded-xl bg-amber-400 px-4 text-base font-semibold text-[#0d2a3a] shadow-md transition enabled:hover:bg-amber-300 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!agreed}
        onClick={onContinue}
      >
        Continue to sign up
      </button>
    </div>
  );
}

export function TermsClient() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-sm text-white/60" role="status">
          Loading…
        </p>
      }
    >
      <TermsInner />
    </Suspense>
  );
}
