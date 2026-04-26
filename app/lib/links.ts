/**
 * Public web links (Universal Links + fallback pages).
 * Base: NEXT_PUBLIC_CARVAULT_LINK_BASE_URL, then browser origin, then
 * https://carvaultlink.com in production, else http://localhost:3000 for local dev.
 */

const PRODUCTION_PUBLIC_BASE = "https://carvaultlink.com";

function normalizeBaseUrl(base: string): string {
  return base.replace(/\/$/, "");
}

function isRunningOnVercelOrProductionNode(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

/**
 * Resolves the public site origin. On the client, prefers `window.location.origin`
 * so the bar URL always matches the current host. On the server, uses env, then
 * production default — never `localhost` in production.
 */
export function getBaseUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return normalizeBaseUrl(window.location.origin);
  }

  const fromEnv = process.env.NEXT_PUBLIC_CARVAULT_LINK_BASE_URL?.trim();
  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
  }

  if (isRunningOnVercelOrProductionNode()) {
    return PRODUCTION_PUBLIC_BASE;
  }

  return "http://localhost:3000";
}

/**
 * Public profile web URL, e.g. https://carvaultlink.com/u/jane
 */
export function getProfileLink(username: string): string {
  const base = getBaseUrl();
  const path = username.replace(/^\/+/, "");
  return `${base}/u/${encodeURIComponent(path)}`;
}

/**
 * Public car web URL, e.g. https://carvaultlink.com/car/<uuid>
 */
export function getCarLink(carId: string): string {
  const base = getBaseUrl();
  const id = String(carId).replace(/^\/+/, "");
  return `${base}/car/${encodeURIComponent(id)}`;
}

/** URL path only (no origin), e.g. `/u/jane` for building the browser canonical. */
export function getProfilePath(username: string): string {
  const path = username.replace(/^\/+/, "");
  return `/u/${encodeURIComponent(path)}`;
}

export function getCarPath(carId: string): string {
  const id = String(carId).replace(/^\/+/, "");
  return `/car/${encodeURIComponent(id)}`;
}

const CARVAULT_APP_SCHEME = "carvault:";

/**
 * In-app / deep-link open URL for profile.
 * Form: `carvault://u/{url-encoded-username}` — two slashes after the colon only (`://`); path has one segment after `u/`.
 * Does not use `carvault:///` (three slashes after the scheme name).
 */
export function getProfileAppDeepLink(username: string): string {
  const raw = safeSegmentValue(username);
  if (!raw) {
    return "#";
  }
  return `${CARVAULT_APP_SCHEME}//u/${encodeURIComponent(raw)}`;
}

/**
 * In-app / deep-link open URL for a car.
 * Form: `carvault://car/{url-encoded-carId}`
 */
export function getCarAppDeepLink(carId: string): string {
  const raw = safeSegmentValue(String(carId));
  if (!raw) {
    return "#";
  }
  return `${CARVAULT_APP_SCHEME}//car/${encodeURIComponent(raw)}`;
}

function safeSegmentValue(value: string): string {
  return String(value).replace(/^\/+/, "").trim();
}

/** Safe decode of dynamic route param (avoids throw if not percent-encoded as expected). */
export function safeDecodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
