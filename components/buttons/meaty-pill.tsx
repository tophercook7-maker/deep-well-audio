export function MeatyPill({ score }: { score: number | null | undefined }) {
  const n = typeof score === "number" && !Number.isNaN(score) ? score : 0;
  const clamped = Math.min(10, Math.max(0, n));
  return (
    <span
      title="Meaty score — depth and teaching richness (0–10)"
      className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-100"
    >
      Meaty {clamped}
    </span>
  );
}
