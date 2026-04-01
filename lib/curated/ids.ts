/** Standard YouTube video id length. */
export const YOUTUBE_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export function isValidYoutubeVideoId(v: unknown): v is string {
  return typeof v === "string" && YOUTUBE_VIDEO_ID_RE.test(v);
}

export function sanitizeSourceId(v: unknown): string {
  if (typeof v !== "string") return "";
  const t = v.replace(/[\u0000]/g, "").trim().slice(0, 120);
  return t;
}

export function sanitizeCategorySlug(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, 80);
  return t.length ? t : null;
}
