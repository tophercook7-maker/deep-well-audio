/**
 * Turn RSS HTML/plain description into a short, site-safe excerpt.
 * Does not invent facts; if nothing usable remains, callers should use a minimal neutral line.
 */

const MAX_LEN = 520;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function trimReadMoreTails(t: string): string {
  return t
    .replace(/\s*[\[(]?\s*read more\s*[\])]?\s*$/i, "")
    .replace(/\s*[\[(]?\s*continue reading\s*[\])]?\s*$/i, "")
    .replace(/\s*\[\s*\.\.\.\s*]\s*$/i, "")
    .replace(/\s*\.{3,}\s*$/u, "…")
    .trim();
}

function collapseEllipsisNoise(t: string): string {
  return t.replace(/…\s*…+/g, "…").replace(/\.{3,}/g, "…");
}

/** Readable title: trim, strip echoed source suffix, tame all-caps wire headlines. */
export function normalizeFeedTitle(raw: string, sourceName?: string): string {
  let t = raw.trim().replace(/\s+/g, " ");
  if (!t.length) return t;

  const letters = t.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 12 && letters === letters.toUpperCase()) {
    t = t
      .split(/\s+/)
      .map((w) => {
        if (/^(UN|WHO|USA|UK|EU|NGO)$/i.test(w)) return w.toUpperCase();
        if (/^[A-Z0-9]{2,}$/.test(w) && w.length <= 5) return w;
        return w.charAt(0) + w.slice(1).toLowerCase();
      })
      .join(" ");
  }

  const sn = typeof sourceName === "string" ? sourceName.trim() : "";
  if (sn.length) {
    t = t.replace(new RegExp(`\\s*[-–—|]\\s*${escapeRegex(sn)}\\s*$`, "i"), "").trim();
    const first = sn.split(/\s*[·|]\s*/)[0]?.trim() ?? "";
    if (first.length && first !== sn) {
      t = t.replace(new RegExp(`\\s*[-–—|]\\s*${escapeRegex(first)}\\s*$`, "i"), "").trim();
    }
  }

  return t.trim();
}

export function normalizeFeedSummary(description: string | undefined, title: string): string {
  const base = typeof description === "string" ? stripHtml(description) : "";
  let t = base.trim();
  t = trimReadMoreTails(t);
  t = collapseEllipsisNoise(t);
  t = t.replace(/^[,;:\s…]+/u, "").replace(/\s+/g, " ").trim();

  if (!t.length) {
    return `Brief from the source — open the link for the full item. Title: ${title.slice(0, 200)}${title.length > 200 ? "…" : ""}`;
  }

  const cutCandidates = t.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  if (cutCandidates.length > 1) {
    t = cutCandidates[0];
  }

  if (t.length <= MAX_LEN) return t;
  const cut = t.slice(0, MAX_LEN);
  const lastSpace = cut.lastIndexOf(" ");
  const neck = lastSpace > MAX_LEN * 0.6 ? lastSpace : MAX_LEN;
  let out = `${t.slice(0, neck).trim()}…`;
  out = collapseEllipsisNoise(out);
  return out;
}
