"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "../auth/supabase-client";
import { isProfileComplete, loadOrCreateProfile } from "../auth/ensureUserProfile";
import { isSignupRole, type SignupRole } from "../auth/signup-roles";
import { DASHBOARD_NAV } from "./navigation";

type DashboardLayoutProps = {
  expectedRole: SignupRole;
  pageTitle: string;
  children?: React.ReactNode;
};

function navLinkClass(active: boolean) {
  return [
    "block rounded-lg px-3 py-2.5 text-sm font-medium transition",
    active
      ? "bg-white/15 text-white"
      : "text-white/70 hover:bg-white/8 hover:text-white",
  ].join(" ");
}

export function DashboardLayout({ expectedRole, pageTitle, children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
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
        return;
      }

      if (profile.role && isSignupRole(profile.role) && profile.role !== expectedRole) {
        router.replace(`/dashboard/${profile.role}`);
        return;
      }

      if (
        profile.role &&
        isSignupRole(profile.role) &&
        !isProfileComplete(profile) &&
        !pathname.startsWith("/onboarding")
      ) {
        router.replace("/onboarding/profile");
        return;
      }

      setEmail(profile.email);
      setRole(profile.role);
    })();
  }, [expectedRole, router, pathname]);

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d2a3a] px-4 py-16 text-center text-red-200">
        <p role="alert">Error: {error}</p>
      </div>
    );
  }

  if (email === null) {
    return (
      <div className="min-h-screen bg-[#0d2a3a] px-4 py-16 text-center text-white/80">
        <p>Loading…</p>
      </div>
    );
  }

  const items = DASHBOARD_NAV[expectedRole];

  return (
    <div className="min-h-screen bg-[#0d2a3a] text-white">
      <header className="flex h-14 shrink-0 items-center justify-end gap-4 border-b border-white/10 px-4 sm:px-6">
        <span className="mr-auto truncate text-sm text-white/85" title={email}>
          {email}
        </span>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
          onClick={signOut}
        >
          Sign out
        </button>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)]">
        <aside className="hidden w-52 shrink-0 border-r border-white/10 p-4 sm:block">
          <nav className="flex flex-col gap-0.5" aria-label="Dashboard">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={navLinkClass(active)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {role ? (
            <p className="mt-6 border-t border-white/10 pt-4 text-xs text-white/45">
              Role: <span className="text-white/70">{role}</span>
            </p>
          ) : null}
        </aside>
        <div className="min-w-0 flex-1 flex-col sm:flex sm:flex-1">
          <nav
            className="flex gap-1 overflow-x-auto border-b border-white/10 p-3 sm:hidden"
            aria-label="Dashboard"
          >
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(active) + " shrink-0 whitespace-nowrap px-2 py-1.5 text-xs"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <main className="p-4 sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
            <div className="mt-6 text-sm text-white/80">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
