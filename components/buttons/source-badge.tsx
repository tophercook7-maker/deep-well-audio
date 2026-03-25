const labels: Record<string, string> = {
  rss: "RSS",
  youtube: "YouTube",
  hybrid: "Multi-source",
  podcast: "Podcast",
};

export function SourceBadge({ source }: { source: string | null | undefined }) {
  const key = (source ?? "").toLowerCase() || "unknown";
  const raw = source ?? "";
  const label = labels[key] ?? (raw ? raw.replace(/-/g, " ") : "Source");
  return (
    <span className="rounded-full border border-line bg-soft/40 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
      {label}
    </span>
  );
}
