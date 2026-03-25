import { CATEGORY_OPTIONS } from "@/lib/types";

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function categoryLabel(key: string | null | undefined): string {
  if (key == null || key === "") return "General";
  const hit = CATEGORY_OPTIONS.find((c) => c.key === key);
  if (hit) return hit.label;
  return key.replace(/-/g, " ");
}
