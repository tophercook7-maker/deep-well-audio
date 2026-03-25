/** Plain text and truncation for RSS/HTML-heavy metadata in the UI. */

const HTML_TAG = /<[^>]*>/g;

export function stripHtmlToPlain(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "";
  const noTags = raw.replace(HTML_TAG, " ");
  try {
    return noTags
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return noTags.replace(/\s+/g, " ").trim();
  }
}

/** Single-line or short-block summary for cards (no HTML noise). */
export function clampSummary(raw: string | null | undefined, maxChars = 200): string {
  const plain = stripHtmlToPlain(raw);
  if (plain.length <= maxChars) return plain;
  const cut = plain.slice(0, maxChars - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${base.trim()}…`;
}

/** Episode description: plain text, capped for list rows. */
export function episodeListDescription(raw: string | null | undefined, maxChars = 240): string | null {
  const plain = stripHtmlToPlain(raw);
  if (!plain) return null;
  if (plain.length <= maxChars) return plain;
  const cut = plain.slice(0, maxChars - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 50 ? cut.slice(0, lastSpace) : cut;
  return `${base.trim()}…`;
}
