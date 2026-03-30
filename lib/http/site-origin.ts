/**
 * Derive the browser-facing origin for redirects (auth callback, errors).
 * Prefer proxy headers on Vercel/hosted Edge so redirects match the Host
 * the user actually used—critical for auth cookies staying on the same site.
 *
 * Do not use `NEXT_PUBLIC_SITE_URL` here: a mismatch (www vs apex, preview vs prod)
 * would redirect to a different host than the one that set cookies.
 */
export function getSiteOriginFromRequest(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    if (host) {
      const proto = (forwardedProto ?? "https").split(",")[0]?.trim() || "https";
      return `${proto}://${host}`;
    }
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}
