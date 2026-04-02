/** Only allow same-origin relative paths for post-login redirects. */
export function safeInternalNext(next: string | null | undefined, fallback = "/explore"): string {
  if (!next || typeof next !== "string") return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  return t;
}
