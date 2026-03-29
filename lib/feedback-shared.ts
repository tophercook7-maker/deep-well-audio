export const FEEDBACK_CATEGORIES = ["bug", "suggestion", "billing", "content", "other"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_STATUSES = ["new", "in_progress", "fixed", "closed"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isFeedbackCategory(v: unknown): v is FeedbackCategory {
  return typeof v === "string" && FEEDBACK_CATEGORIES.includes(v as FeedbackCategory);
}

export function isFeedbackStatus(v: unknown): v is FeedbackStatus {
  return typeof v === "string" && FEEDBACK_STATUSES.includes(v as FeedbackStatus);
}

export function sanitizeFeedbackMessage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.replace(/\u0000/g, "").trim();
  if (!t.length) return null;
  if (t.length > 8000) return null;
  return t;
}

export function sanitizeOptionalUrl(raw: unknown, maxLen: number): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().slice(0, maxLen);
  return t.length ? t : null;
}

export function sanitizeOptionalEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().toLowerCase();
  if (!t || !EMAIL_RE.test(t)) return null;
  return t;
}

export function sanitizeUserAgent(raw: unknown): string | null {
  return sanitizeOptionalUrl(raw, 512);
}

/** ISO string for `site_feedback.replied_at`, or null to clear. */
export function parseFeedbackRepliedAtIso(raw: unknown): string | null {
  if (raw === undefined) return null;
  if (raw === null) return null;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t.length) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
