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
    secure: process.env.NODE_ENV === "production",
  };
}
