/**
 * Centralized environment access for Deep Well Audio.
 *
 * - `NEXT_PUBLIC_*` helpers are safe to import from client components.
 * - Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `SYNC_API_SECRET`) are also read here;
 *   Next.js does not expose non-public env vars to the browser bundle.
 */

function trimStr(v: string | null | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

/** Remove trailing slashes so redirect URLs compose consistently. */
export function normalizeSiteUrlBase(raw: string | null | undefined): string | null {
  const t = trimStr(raw);
  if (!t) return null;
  return t.replace(/\/+$/, "");
}

// ---------------------------------------------------------------------------
// Public (browser + server; values embedded for NEXT_PUBLIC_*)
// ---------------------------------------------------------------------------

export function getPublicSupabaseUrl(): string | null {
  return trimStr(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getPublicSupabaseAnonKey(): string | null {
  return trimStr(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Canonical public site URL (local or production).
 * Use for email confirmation redirects (`/auth/callback`). In production, set this to the same
 * origin you configure in Supabase Auth (Site URL + Redirect URLs).
 */
export function getPublicSiteUrl(): string | null {
  return normalizeSiteUrlBase(process.env.NEXT_PUBLIC_SITE_URL);
}

// ---------------------------------------------------------------------------
// Server-only ingestion / API protection
// ---------------------------------------------------------------------------

export function getServiceRoleKey(): string | null {
  return trimStr(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSyncApiSecret(): string | null {
  return trimStr(process.env.SYNC_API_SECRET);
}

/** Optional — enable when ready (YouTube ingestion). */
export function getOptionalYoutubeApiKey(): string | null {
  return trimStr(process.env.YOUTUBE_API_KEY);
}

// ---------------------------------------------------------------------------
// Presence checks (graceful — no throws)
// ---------------------------------------------------------------------------

export function hasPublicSupabaseEnv(): boolean {
  return Boolean(getPublicSupabaseUrl() && getPublicSupabaseAnonKey());
}

export function hasServiceSupabaseEnv(): boolean {
  if (!hasPublicSupabaseEnv()) return false;
  return Boolean(getServiceRoleKey());
}

export function hasSyncSecret(): boolean {
  return Boolean(getSyncApiSecret());
}

export function hasYoutubeKey(): boolean {
  return Boolean(getOptionalYoutubeApiKey());
}

/** True when a debug / setup panel is useful (local dev or Vercel preview). */
export function isNonProductionDeploy(): boolean {
  return process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";
}
