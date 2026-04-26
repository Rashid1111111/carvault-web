/**
 * Public web links for CarVault (Universal Links + fallback pages).
 * Base URL: NEXT_PUBLIC_CARVAULT_LINK_BASE_URL, or http://localhost:3000 when unset.
 */

function normalizeBaseUrl(base: string): string {
  return base.replace(/\/$/, "");
}

function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CARVAULT_LINK_BASE_URL?.trim();
  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
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
