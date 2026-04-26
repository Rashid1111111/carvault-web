import { getBaseUrl } from "./links";

const CALLBACK_PATH = "/auth/callback";

/**
 * `signInWithOtp` / magic-link redirect target. Uses local dev origin for
 * http://localhost / 127.0.0.1; otherwise the same public base as the site
 * (see `getBaseUrl`) so production never points at localhost.
 */
export function getAuthCallbackUrl(): string {
  if (typeof window !== "undefined") {
    const o = window.location.origin;
    if (o.startsWith("http://localhost:") || o.startsWith("http://127.0.0.1:")) {
      return `${o}${CALLBACK_PATH}`;
    }
  }
  return `${getBaseUrl()}${CALLBACK_PATH}`;
}
