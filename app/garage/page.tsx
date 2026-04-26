"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../auth/supabase-client";
import { isProfileComplete, loadOrCreateProfile } from "../auth/ensureUserProfile";
import { isSignupRole } from "../auth/signup-roles";

export default function GaragePage() {
  const router = useRouter();
  const [line, setLine] = useState("Loading…");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth
      .getUser()
      .then(async ({ data: { user }, error }) => {
        if (error) {
          setLine(`Error: ${error.message}`);
          return;
        }
        if (!user) {
          setLine("Not signed in.");
          return;
        }
        const profile = await loadOrCreateProfile(supabase, user);
        if (profile.error) {
          setLine(`Error: ${profile.error}`);
          return;
        }
        if (profile.role && isSignupRole(profile.role)) {
          if (!isProfileComplete(profile)) {
            router.replace("/onboarding/profile");
            return;
          }
          router.replace(`/dashboard/${profile.role}`);
          return;
        }
        setLine(
          "Signed in, but your profile has no CarVault role yet. Use the signup flow to choose an account type, or contact support."
        );
      })
      .catch((e) => {
        setLine(e instanceof Error ? e.message : "Something went wrong");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d2a3a] px-4 py-16 text-white">
      <p className="text-center text-lg">{line}</p>
    </div>
  );
}
