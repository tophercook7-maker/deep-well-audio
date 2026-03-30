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

/** Placeholder values sometimes end up in Vercel env by mistake; they must not reach `new URL(...)`. */
const INVALID_SITE_URL_SENTINELS = new Set(["undefined", "null"]);

/**
 * Parsed absolute site URL when `NEXT_PUBLIC_SITE_URL` is set and valid; otherwise `null`.
 *
 * **Production:** Set to `https://deepwellaudio.com` (no trailing slash). Required for Stripe checkout
 * redirects, `hasStripeBillingConfigured()`, and consistent auth callback URLs.
 * `getSafeAbsoluteSiteUrl()` adds metadata/OG fallbacks only; it does **not** substitute here.
 */
export function resolvePublicSiteUrlStrict(): string | null {
  const raw = trimStr(process.env.NEXT_PUBLIC_SITE_URL);
  if (!raw || INVALID_SITE_URL_SENTINELS.has(raw.toLowerCase())) {
    return null;
  }
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
  try {
    const u = new URL(withProto);
    const path = u.pathname.replace(/\/+$/, "");
    return path ? `${u.origin}${path}` : u.origin;
  } catch {
    return null;
  }
}

/** Production marketing origin when `NEXT_PUBLIC_SITE_URL` is unset (e.g. env slip on first deploy). */
const PRODUCTION_CANONICAL_SITE = "https://deepwellaudio.com";

/**
 * Absolute site URL for metadata (`metadataBase`) and Open Graph.
 * Prefers `NEXT_PUBLIC_SITE_URL`, then sensible deploy defaults (production apex, Vercel preview host), then localhost.
 */
export function getSafeAbsoluteSiteUrl(): string {
  const strict = resolvePublicSiteUrlStrict();
  if (strict) return strict;
  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_CANONICAL_SITE;
  }
  const vercelUrl = trimStr(process.env.VERCEL_URL);
  if (process.env.VERCEL_ENV === "preview" && vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return "http://localhost:3000";
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

/** Server-only Stripe secret API key. */
export function getStripeSecretKey(): string | null {
  return trimStr(process.env.STRIPE_SECRET_KEY);
}

/** Server-only webhook signing secret (`whsec_…`). */
export function getStripeWebhookSecret(): string | null {
  return trimStr(process.env.STRIPE_WEBHOOK_SECRET);
}

/** Safe for client bundles — publishable key for future Elements; checkout uses hosted page. */
export function getPublicStripePublishableKey(): string | null {
  return trimStr(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function getStripePriceMonthly(): string | null {
  return trimStr(process.env.STRIPE_PRICE_MONTHLY);
}

export function getStripePriceYearly(): string | null {
  return trimStr(process.env.STRIPE_PRICE_YEARLY);
}

/** True when Stripe subscription checkout can run server-side (secret, price IDs, publishable key, site URL for redirects). */
export function hasStripeBillingConfigured(): boolean {
  return Boolean(
    getStripeSecretKey() &&
      getStripePriceMonthly() &&
      getStripePriceYearly() &&
      getPublicStripePublishableKey() &&
      resolvePublicSiteUrlStrict()
  );
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

/**
 * Dev-only escape hatch for `/api/account/upgrade-stub`. Enable with `ALLOW_STUB_PREMIUM_UPGRADE=1`; keep unset in production (Stripe + webhook is source of truth).
 */
export function allowStubPremiumUpgrade(): boolean {
  return trimStr(process.env.ALLOW_STUB_PREMIUM_UPGRADE) === "1";
}

export function hasYoutubeKey(): boolean {
  return Boolean(getOptionalYoutubeApiKey());
}

/**
 * Optional `mailto:` for the Premium waitlist CTA on `/pricing` (e.g. `hello@yourdomain.com`).
 * When unset, the page still explains that Premium is not for sale yet.
 */
export function getPremiumWaitlistMailto(): string | null {
  const e = trimStr(process.env.NEXT_PUBLIC_PREMIUM_WAITLIST_EMAIL);
  if (!e) return null;
  const subject = encodeURIComponent("Deep Well Audio — Premium waitlist");
  return `mailto:${e}?subject=${subject}`;
}

/** True when a debug / setup panel is useful (local dev or Vercel preview). */
export function isNonProductionDeploy(): boolean {
  return process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";
}

/**
 * Weekly World Watch digest (`/api/cron/world-watch-weekly`). Must be exactly `1` to run sends.
 * Leave unset for launch—no Resend/cron required; `/world-watch` stays fully available on-site.
 */
export function isWorldWatchWeeklyDigestEnabled(): boolean {
  return trimStr(process.env.WORLD_WATCH_WEEKLY_DIGEST_ENABLED) === "1";
}

/**
 * Bearer for cron routes: `/api/cron/world-watch-weekly` (digest), `/api/cron/world-watch-ingest` (RSS pull).
 * Set `CRON_SECRET` in the project environment. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when this var is defined.
 */
export function getCronSecret(): string | null {
  return trimStr(process.env.CRON_SECRET);
}

/**
 * Resend API for the optional World Watch weekly digest only—not needed for core app or Premium.
 * https://resend.com/docs/api-reference/emails/send-email
 */
export function getResendApiKey(): string | null {
  return trimStr(process.env.RESEND_API_KEY);
}

/** Verified sender in Resend; only used when digest email is enabled. */
export function getResendFromWorldWatch(): string | null {
  return trimStr(process.env.RESEND_FROM_WORLD_WATCH);
}

/**
 * Comma- or semicolon-separated emails allowed to open `/admin/feedback` and PATCH feedback rows.
 * Example: `you@domain.com,ops@domain.com`
 */
export function getFeedbackAdminEmails(): string[] {
  const raw = trimStr(process.env.FEEDBACK_ADMIN_EMAILS);
  if (!raw) return [];
  return raw
    .split(/[,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isFeedbackAdminEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== "string") return false;
  const allow = new Set(getFeedbackAdminEmails());
  return allow.has(email.trim().toLowerCase());
}
