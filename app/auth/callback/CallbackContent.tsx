"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/auth-js";
import { createBrowserSupabaseClient } from "../supabase-client";

function parseHashParams(hash: string): URLSearchParams {
  const withoutLeading = hash.startsWith("#") ? hash.slice(1) : hash;
  return new URLSearchParams(withoutLeading);
}

function isEmailOtpType(value: string): value is EmailOtpType {
  return (
    value === "signup" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "email_change" ||
    value === "email"
  );
}

export function CallbackContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (typeof window === "undefined") return;

      const search = new URLSearchParams(window.location.search);
      const hashParams = parseHashParams(window.location.hash);

      const err =
        search.get("error") ||
        search.get("error_code") ||
        hashParams.get("error") ||
        hashParams.get("error_code");
      const errDescription =
        search.get("error_description") || hashParams.get("error_description");

      if (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(errDescription || err);
        }
        return;
      }

      const supabase = createBrowserSupabaseClient();

      await supabase.auth.initialize();

      const { data: afterInit } = await supabase.auth.getSession();
      if (!cancelled && afterInit.session?.user) {
        router.replace("/garage");
        return;
      }

      const code = search.get("code") || hashParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchangeError) {
          setStatus("error");
          setMessage(exchangeError.message);
          return;
        }
        router.replace("/garage");
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (cancelled) return;
        if (sessionError) {
          setStatus("error");
          setMessage(sessionError.message);
          return;
        }
        router.replace("/garage");
        return;
      }

      const tokenHash = search.get("token_hash");
      const typeRaw = search.get("type");
      if (tokenHash && typeRaw) {
        if (!isEmailOtpType(typeRaw)) {
          if (!cancelled) {
            setStatus("error");
            setMessage(`Unsupported link type: ${typeRaw}`);
          }
          return;
        }
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: typeRaw,
          token_hash: tokenHash,
        });
        if (cancelled) return;
        if (otpError) {
          setStatus("error");
          setMessage(otpError.message);
          return;
        }
        router.replace("/garage");
        return;
      }

      const { data: finalCheck } = await supabase.auth.getSession();
      if (!cancelled && finalCheck.session?.user) {
        router.replace("/garage");
        return;
      }

      if (!cancelled) {
        setStatus("error");
        setMessage(
          "Could not complete sign-in. This link may be missing auth data, expired, or already used. Request a new sign-in email."
        );
      }
    })().catch((e) => {
      if (cancelled) return;
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Sign-in failed");
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p
        className={status === "error" ? "text-sm text-red-300" : "text-sm text-white/80"}
        role={status === "error" ? "alert" : undefined}
      >
        {message}
      </p>
    </div>
  );
}
