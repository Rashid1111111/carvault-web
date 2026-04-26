import type { SupabaseClient, User } from "@supabase/supabase-js";

const PENDING_ROLE_KEY = "carvault_pending_role";

export type LoadedProfile = {
  email: string;
  role: string | null;
  full_name: string | null;
  avatar_url: string | null;
  error: string | null;
};

export function isProfileComplete(p: Pick<LoadedProfile, "full_name">): boolean {
  return typeof p.full_name === "string" && p.full_name.trim().length > 0;
}

export function storePendingSignupRole(role: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_ROLE_KEY, role);
  } catch {
    /* ignore quota / private mode */
  }
}

function takePendingSignupRole(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(PENDING_ROLE_KEY);
    if (v) sessionStorage.removeItem(PENDING_ROLE_KEY);
    return v;
  } catch {
    return null;
  }
}

function roleFromUserMetadata(user: User): string | null {
  const m = user.user_metadata;
  if (m && typeof m === "object" && "role" in m && typeof (m as { role?: unknown }).role === "string") {
    return (m as { role: string }).role;
  }
  return null;
}

type ProfileRow = {
  email: string | null;
  role: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

function rowToLoaded(user: User, row: ProfileRow | null, error: string | null): LoadedProfile {
  if (error) {
    return { email: user.email ?? "", role: null, full_name: null, avatar_url: null, error };
  }
  if (!row) {
    return {
      email: user.email ?? "",
      role: null,
      full_name: null,
      avatar_url: null,
      error: null,
    };
  }
  return {
    email: row.email ?? user.email ?? "",
    role: row.role,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    error: null,
  };
}

export async function loadOrCreateProfile(
  supabase: SupabaseClient,
  user: User
): Promise<LoadedProfile> {
  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("email, role, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    return rowToLoaded(user, null, fetchError.message);
  }

  if (existing) {
    return rowToLoaded(user, existing as ProfileRow, null);
  }

  const pending = takePendingSignupRole();
  const fromMeta = roleFromUserMetadata(user);
  const role = pending ?? fromMeta;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email,
    role: role ?? null,
  });

  if (insertError) {
    return rowToLoaded(user, null, insertError.message);
  }

  return {
    email: user.email ?? "",
    role: role ?? null,
    full_name: null,
    avatar_url: null,
    error: null,
  };
}
