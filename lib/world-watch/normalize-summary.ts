/**
 * Turn RSS HTML/plain description into a short, site-safe excerpt.
 * Does not invent facts; if nothing usable remains, callers should use a minimal neutral line.
 */

const MAX_LEN = 520;

/** Strip common HTML tags without full parsing (good enough for excerpts). */
function stripHtml(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeFeedSummary(
  description: string | undefined,
  title: string
): string {
  const base = typeof description === "string" ? stripHtml(description) : "";
  const t = base.trim();
  if (!t.length) {
    return `Brief from the source — open the link for the full item. Title: ${title.slice(0, 200)}${title.length > 200 ? "…" : ""}`;
  }
  if (t.length <= MAX_LEN) return t;
  const cut = t.slice(0, MAX_LEN);
  const lastSpace = cut.lastIndexOf(" ");
  const neck = lastSpace > MAX_LEN * 0.6 ? lastSpace : MAX_LEN;
  return `${t.slice(0, neck).trim()}…`;
}
