"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { EmailOtpForm } from "../EmailOtpForm";
import { isSignupRole, SESSION_CHOSEN_ROLE_KEY, SESSION_TERMS_OK_KEY } from "../signup-roles";

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") ?? "";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isSignupRole(roleParam)) {
      router.replace("/auth/choose-account");
      return;
    }

    let termsOk = false;
    let chosen: string | null = null;
    try {
      termsOk = sessionStorage.getItem(SESSION_TERMS_OK_KEY) === "1";
      chosen = sessionStorage.getItem(SESSION_CHOSEN_ROLE_KEY);
    } catch {
      router.replace("/auth/choose-account");
      return;
    }

    if (!termsOk || chosen !== roleParam) {
      router.replace(`/auth/terms?role=${encodeURIComponent(roleParam)}`);
      return;
    }

    setReady(true);
  }, [roleParam, router]);

  if (!isSignupRole(roleParam)) {
    return (
      <p className="text-center text-sm text-white/60" role="status">
        Redirecting…
      </p>
    );
  }

  if (!ready) {
    return (
      <p className="text-center text-sm text-white/60" role="status">
        Loading…
      </p>
    );
  }

  return (
    <EmailOtpForm
      title="Create your CarVault account"
      role={roleParam}
      ctaLabel="Continue"
      buttonClassName="w-full min-h-[3.25rem] rounded-xl bg-amber-400 px-4 text-base font-semibold text-[#0d2a3a] shadow-md transition enabled:hover:bg-amber-300 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

export function SignupClient() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-sm text-white/60" role="status">
          Loading…
        </p>
      }
    >
      <SignupInner />
    </Suspense>
  );
}
