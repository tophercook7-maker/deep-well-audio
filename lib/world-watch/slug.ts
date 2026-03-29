import { randomBytes } from "crypto";

/** URL-safe slug base from title (may need uniqueness suffix elsewhere). */
export function slugifyWorldWatchTitle(title: string): string {
  const t = title.trim();
  const base = t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
  return base.length ? base : "item";
}

export function uniqueWorldWatchSlugSuffix(): string {
  return randomBytes(3).toString("hex");
}
