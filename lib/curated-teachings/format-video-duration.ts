/** Format seconds as H:MM:SS or M:SS for card badges. */
export function formatVideoDuration(sec: number | undefined | null): string {
  if (sec == null || !Number.isFinite(sec) || sec <= 0) return "";
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${r.toString().padStart(2, "0")}`;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
