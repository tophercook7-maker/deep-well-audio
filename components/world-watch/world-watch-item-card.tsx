import type { WorldWatchItemPublic } from "@/lib/world-watch/items";
import { worldWatchCategoryLabel } from "@/lib/world-watch/items";

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

export function WorldWatchItemCard({ item }: { item: WorldWatchItemPublic }) {
  const categoryLabel = worldWatchCategoryLabel(item.category);
  const dateLabel = formatPublishedDate(item.published_at);

  return (
    <article className="card border-line/75 overflow-hidden">
      {item.image_url ? (
        <div className="border-b border-line/50 bg-soft/20">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-supplied URLs; avoid next/image remote allowlist churn */}
          <img
            src={item.image_url}
            alt=""
            loading="lazy"
            className="max-h-[min(18rem,48vh)] w-full object-cover object-center"
          />
        </div>
      ) : null}
      <div className="space-y-4 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {categoryLabel ? (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/65">{categoryLabel}</span>
          ) : null}
          <time className="text-[11px] text-slate-500" dateTime={item.published_at}>
            {dateLabel}
          </time>
        </div>
        <h2 className="text-lg font-semibold leading-snug text-white sm:text-xl">{item.title}</h2>
        {item.source_name || item.source_url ? (
          <p className="text-xs leading-relaxed text-slate-500">
            {item.source_name ? <span className="text-slate-400">Source · </span> : null}
            {item.source_name ? <span className="text-slate-400">{item.source_name}</span> : null}
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
        <div className="text-sm leading-relaxed text-slate-300">
          {item.summary.split("\n").map((para, i) => (
            <p key={i} className={i > 0 ? "mt-3" : ""}>
              {para}
            </p>
          ))}
        </div>
        {item.reflection ? (
          <div className="border-l-2 border-amber-200/35 bg-soft/15 py-3 pl-4 pr-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">Reflection</p>
            <div className="mt-2 text-sm leading-relaxed text-slate-200/95">
              {item.reflection.split("\n").map((para, i) => (
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
