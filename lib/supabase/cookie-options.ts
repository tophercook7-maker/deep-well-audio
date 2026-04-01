import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Shared auth cookie flags for browser + server + middleware.
 * `secure: true` in production matches HTTPS and avoids browsers treating
 * session cookies inconsistently across environments.
 */
export function getSupabaseAuthCookieOptions(): CookieOptionsWithName {
  return {
    path: "/",
    sameSite: "lax",
    /**
     * Production must be HTTPS so `Secure` cookies are stored. If `NEXT_PUBLIC_SITE_URL` uses `http://`
     * in production, sessions will not persist in browsers that enforce Secure.
     */
    secure: process.env.NODE_ENV === "production",
  };
}
