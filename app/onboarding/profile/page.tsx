"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../../auth/supabase-client";
import {
  isProfileComplete,
  loadOrCreateProfile,
} from "../../auth/ensureUserProfile";
import { isSignupRole } from "../../auth/signup-roles";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    (async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/auth/login");
        return;
      }
      const profile = await loadOrCreateProfile(supabase, user);
      if (profile.error) {
        setError(profile.error);
        setLoading(false);
        return;
      }
      if (!profile.role || !isSignupRole(profile.role)) {
        setError("Choose an account type before completing your profile.");
        setLoading(false);
        return;
      }
      if (isProfileComplete(profile)) {
        router.replace(`/dashboard/${profile.role}`);
        return;
      }
      setRole(profile.role);
      if (profile.full_name) setName(profile.full_name);
      if (profile.avatar_url) setAvatarUrl(profile.avatar_url);
      setLoading(false);
    })();
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name.");
      return;
    }
    if (!role) return;
    setSaving(true);
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      router.replace("/auth/login");
      return;
    }
    const av = avatarUrl.trim();
    const { error: upError } = await supabase
      .from("profiles")
      .update({
        full_name: trimmed,
        avatar_url: av.length > 0 ? av : null,
      })
      .eq("id", user.id);
    if (upError) {
      setError(upError.message);
      setSaving(false);
      return;
    }
    router.replace(`/dashboard/${role}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d2a3a] px-4 py-16 text-center text-white/80">
        <p>Loading…</p>
      </div>
    );
  }

  if (error && !role) {
    return (
      <div className="min-h-screen bg-[#0d2a3a] px-4 py-16 text-center text-red-200">
        <p role="alert" className="text-sm">
          {error}
        </p>
        <a
          className="mt-4 inline-block text-amber-300 underline"
          href="/auth/choose-account"
        >
          Go to account type
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d2a3a] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <h1 className="text-center text-xl font-semibold sm:text-2xl">Complete your profile</h1>
        <p className="mt-2 text-center text-sm text-white/55">
          Add your name{role ? ` for your ${role} account` : ""} to continue to CarVault.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-white/80">
              Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-base text-white placeholder:text-white/35 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/25"
              placeholder="Your name"
              required
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-white/80">
              Avatar (optional)
            </label>
            <p className="mt-0.5 text-xs text-white/40">Image URL (https://…)</p>
            <input
              id="avatar_url"
              name="avatar_url"
              type="text"
              inputMode="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="mt-2 w-full min-h-12 rounded-xl border border-white/15 bg-white/5 px-4 text-base text-white placeholder:text-white/35 outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/25"
              placeholder="https://…"
              disabled={saving}
            />
          </div>
          {error && role ? (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full min-h-12 rounded-xl bg-amber-400 px-4 text-base font-semibold text-[#0d2a3a] shadow-md transition enabled:hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save and continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
