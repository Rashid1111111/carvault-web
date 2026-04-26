"use client";

import { useEffect, useState } from "react";

type BrowserCanonicalUrlProps = {
  /** e.g. `/u/someone` (same path the address bar would use) */
  path: string;
  /** SSR + first paint; must not be localhost in production (from `getProfileLink` / `getCarLink` on server) */
  serverFallback: string;
};

/**
 * Shows the full canonical https URL. After mount, matches `window.location.origin + path`
 * so production always shows the real domain the user opened.
 */
export function BrowserCanonicalUrl({ path, serverFallback }: BrowserCanonicalUrlProps) {
  const [url, setUrl] = useState(serverFallback);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = path.startsWith("/") ? path : `/${path}`;
    setUrl(`${window.location.origin.replace(/\/$/, "")}${p}`);
  }, [path]);

  return (
    <span className="break-all text-sm text-amber-200/90" data-testid="canonical-url">
      {url}
    </span>
  );
}
