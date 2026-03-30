import type { WorldWatchItemPublic } from "@/lib/world-watch/items";
import { worldWatchCategoryLabel, worldWatchHeroImage } from "@/lib/world-watch/items";

function formatPublishedDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

type Props = {
  item: WorldWatchItemPublic;
  /** Larger editorial treatment for the lead story. */
  variant?: "default" | "featured";
  /** When set, only the first N paragraphs are shown (e.g. homepage / preview surfaces). */
  maxSummaryParagraphs?: number;
  /** When false, hides the reflection block (compact previews). Default true. */
  showReflection?: boolean;
};

export function WorldWatchItemCard({
  item,
  variant = "default",
  maxSummaryParagraphs,
  showReflection = true,
}: Props) {
  const categoryLabel = worldWatchCategoryLabel(item.category);
  const dateLabel = formatPublishedDate(item.published_at);
  const hero = worldWatchHeroImage(item);
  const featured = variant === "featured";
  const reflectionRaw = typeof item.reflection === "string" ? item.reflection.trim() : "";
  const reflection = showReflection ? reflectionRaw : "";
  const allSummaryParas = item.summary
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const summaryParas =
    typeof maxSummaryParagraphs === "number"
      ? allSummaryParas.slice(0, Math.max(0, maxSummaryParagraphs))
      : allSummaryParas;

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-line/75 bg-[rgba(15,23,42,0.35)] ${
        featured ? "shadow-[0_20px_50px_rgba(0,0,0,0.25)]" : ""
      } ${!hero && featured ? "border-l-[3px] border-l-amber-200/35" : ""}`}
    >
      {hero ? (
        <div className="border-b border-line/40 bg-soft/15">
          {/* eslint-disable-next-line @next/next/no-img-element -- curated URLs; avoid next/image remote allowlist churn */}
          <img
            src={hero}
            alt=""
            loading="lazy"
            className={
              featured
                ? "max-h-[min(22rem,52vh)] w-full object-cover object-center sm:max-h-[min(26rem,55vh)]"
                : "max-h-[min(11rem,28vh)] w-full object-cover object-center sm:max-h-[min(13rem,32vh)]"
            }
          />
        </div>
      ) : featured ? (
        <div className="border-b border-line/40 bg-gradient-to-br from-accent/[0.14] via-soft/18 to-transparent px-7 py-6 sm:px-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/50">Lead story</p>
        </div>
      ) : (
        <div className="h-px bg-gradient-to-r from-accent/35 via-line/45 to-transparent" aria-hidden />
      )}
      <div className={featured ? "space-y-6 p-7 sm:p-9" : "space-y-4 p-6 sm:p-7"}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {item.pinned ? (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Editor&apos;s note</span>
              <span className="select-none text-slate-600" aria-hidden>
                ·
              </span>
            </>
          ) : null}
          {categoryLabel ? (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/55">{categoryLabel}</span>
              <span className="select-none text-slate-600" aria-hidden>
                ·
              </span>
            </>
          ) : null}
          <time className="text-[11px] tabular-nums tracking-tight text-slate-400" dateTime={item.published_at}>
            {dateLabel}
          </time>
        </div>
        <h2
          className={`font-semibold leading-snug tracking-tight text-white ${
            featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"
          }`}
        >
          {item.title}
        </h2>
        {item.source_name || item.source_url ? (
          <p className="text-[13px] leading-relaxed text-slate-500">
            {item.source_name ? <span className="text-slate-400/95">{item.source_name}</span> : null}
            {item.source_url && item.source_name ? <span className="text-slate-600"> · </span> : null}
            {item.source_url ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-amber-200/80 underline-offset-2 transition hover:text-amber-100 hover:underline"
              >
                Read at source
              </a>
            ) : null}
          </p>
        ) : null}
        <div
          className={`max-w-prose leading-[1.65] text-slate-300/95 ${featured ? "text-base" : "text-sm"} ${
            maxSummaryParagraphs != null && summaryParas.length > 0 ? "[&_p:last-child]:line-clamp-5" : ""
          }`}
        >
          {summaryParas.map((para, i) => (
            <p key={i} className={i > 0 ? "mt-3" : ""}>
              {para}
            </p>
          ))}
        </div>
        {reflection ? (
          <div className="border-l-2 border-amber-200/30 bg-soft/10 py-3 pl-4 pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/65">Reflection</p>
            <div className="mt-2 text-sm leading-relaxed text-slate-200/95 sm:text-[0.9375rem]">
              {reflection
                .split("\n")
                .map((p) => p.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} className={i > 0 ? "mt-3" : ""}>
                    {para}
                  </p>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
