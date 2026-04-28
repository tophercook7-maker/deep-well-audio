import { BookOpen, ListChecks, Scale, ScrollText, Sparkles } from "lucide-react";
import type { WorldWatchItemPublic } from "@/lib/world-watch/items";
import { worldWatchCategoryLabel, worldWatchHeroImage } from "@/lib/world-watch/items";
import { ScriptureLinkedText } from "@/components/study/scripture-linked-text";
import { WorldWatchRelatedScripture } from "@/components/world-watch/world-watch-related-scripture";

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

type DepthKind = "commentary" | "scripture" | "discernment" | "takeaways";

const depthShell: Record<
  DepthKind,
  { label: string; icon: typeof BookOpen; bar: string; soft: string }
> = {
  commentary: {
    label: "Pastoral commentary",
    icon: BookOpen,
    bar: "border-l-[3px] border-amber-200/45",
    soft: "from-amber-500/[0.07] via-transparent to-transparent",
  },
  scripture: {
    label: "Biblical framing",
    icon: ScrollText,
    bar: "border-l-[3px] border-sky-200/40",
    soft: "from-sky-500/[0.06] via-transparent to-transparent",
  },
  discernment: {
    label: "Discernment",
    icon: Scale,
    bar: "border-l-[3px] border-violet-300/35",
    soft: "from-violet-500/[0.06] via-transparent to-transparent",
  },
  takeaways: {
    label: "Carry this week",
    icon: ListChecks,
    bar: "border-l-[3px] border-emerald-300/40",
    soft: "from-emerald-500/[0.06] via-transparent to-transparent",
  },
};

function DepthParagraphs({ lines }: { lines: string[] }) {
  return (
    <div className="mt-3 space-y-3 text-[0.9375rem] leading-[1.72] text-slate-200/95 sm:text-base sm:leading-[1.75]">
      {lines.map((para, i) => (
        <p key={i}>
          <ScriptureLinkedText text={para} />
        </p>
      ))}
    </div>
  );
}

function DepthSection({
  kind,
  text,
  variant,
}: {
  kind: DepthKind;
  text: string;
  variant: "default" | "featured";
}) {
  const meta = depthShell[kind];
  const Icon = meta.icon;
  const rawLines = text
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!rawLines.length) return null;

  const pad = variant === "featured" ? "sm:pl-6 sm:pr-5 sm:py-5" : "sm:pl-5 sm:pr-4 sm:py-4";

  if (kind === "scripture") {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-line/45 bg-[rgba(8,12,18,0.55)] py-4 pl-4 pr-3 ${pad} ${meta.bar} backdrop-blur-sm`}
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${meta.soft}`} aria-hidden />
        <div className="relative flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-500/[0.08] text-sky-100/90">
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-200/70">{meta.label}</p>
            <ul className="mt-3 space-y-2.5 font-serif text-[0.9375rem] leading-snug tracking-[0.01em] text-slate-100/95">
              {rawLines.map((line, i) => (
                <li key={i} className="border-b border-line/35 pb-2.5 last:border-0 last:pb-0">
                  <ScriptureLinkedText text={line} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "takeaways") {
    const items = rawLines.map((line) => line.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
    if (!items.length) return null;
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-line/45 bg-[rgba(8,12,18,0.55)] py-4 pl-4 pr-3 ${pad} ${meta.bar} backdrop-blur-sm`}
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${meta.soft}`} aria-hidden />
        <div className="relative flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-100/85">
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/65">{meta.label}</p>
            <ul className="mt-3 space-y-3">
              {items.map((line, i) => (
                <li key={i} className="flex gap-3 text-[0.9375rem] leading-[1.65] text-slate-200/95">
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400/70"
                    aria-hidden
                  />
                  <span>
                    <ScriptureLinkedText text={line} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "discernment") {
    const bullets = rawLines.every((l) => /^[-•*]/.test(l));
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-line/45 bg-[rgba(8,12,18,0.55)] py-4 pl-4 pr-3 ${pad} ${meta.bar} backdrop-blur-sm`}
      >
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${meta.soft}`} aria-hidden />
        <div className="relative flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/[0.08] text-violet-100/85">
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200/65">{meta.label}</p>
            {bullets ? (
              <ul className="mt-3 space-y-2.5 text-[0.9375rem] leading-[1.7] text-slate-300/95">
                {rawLines.map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2 font-mono text-xs text-violet-300/50" aria-hidden>
                      —
                    </span>
                    <span>
                      <ScriptureLinkedText text={line.replace(/^[-•*]\s*/, "").trim()} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <DepthParagraphs lines={rawLines} />
            )}
          </div>
        </div>
      </div>
    );
  }

  /* commentary */
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-line/45 bg-[rgba(8,12,18,0.55)] py-4 pl-4 pr-3 ${pad} ${meta.bar} backdrop-blur-sm`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${meta.soft}`} aria-hidden />
      <div className="relative flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/25 bg-amber-500/[0.1] text-amber-100/90">
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/70">{meta.label}</p>
          <DepthParagraphs lines={rawLines} />
        </div>
      </div>
    </div>
  );
}

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
          {summaryParas.length === 0 ? (
            <p className="text-slate-500 italic">
              Summary is still being prepared for this story—the title and link above remain the starting place.
            </p>
          ) : (
            summaryParas.map((para, i) => (
              <p key={i} className={i > 0 ? "mt-3" : ""}>
                <ScriptureLinkedText text={para} />
              </p>
            ))
          )}
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
                    <ScriptureLinkedText text={para} />
                  </p>
                ))}
            </div>
          </div>
        ) : null}
        <div className={featured ? "mt-2" : "mt-1"}>
          <WorldWatchRelatedScripture category={item.category} storyKey={item.id} />
        </div>
        {item.premium_depth ? (
          (() => {
            const depth = item.premium_depth;
            const blocks = [
              depth.member_commentary ? (
                <DepthSection key="mc" kind="commentary" variant={variant} text={depth.member_commentary} />
              ) : null,
              depth.scripture_refs ? (
                <DepthSection key="sr" kind="scripture" variant={variant} text={depth.scripture_refs} />
              ) : null,
              depth.discernment_notes ? (
                <DepthSection key="dn" kind="discernment" variant={variant} text={depth.discernment_notes} />
              ) : null,
              depth.key_takeaways ? (
                <DepthSection key="kt" kind="takeaways" variant={variant} text={depth.key_takeaways} />
              ) : null,
            ].filter(Boolean);
            if (blocks.length === 0) return null;
            return (
              <div
                className={`relative overflow-hidden rounded-[1.15rem] border border-accent/20 bg-gradient-to-b from-accent/[0.07] via-[rgba(10,14,20,0.65)] to-[rgba(8,11,16,0.75)] p-px shadow-[0_20px_48px_-28px_rgba(0,0,0,0.65)] ${featured ? "mt-2" : "mt-1"}`}
              >
                <div className="rounded-[1.05rem] bg-[rgba(6,9,14,0.4)] px-4 py-5 backdrop-blur-md sm:px-5 sm:py-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-line/40 pb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/[0.12] text-amber-100/90">
                      <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">Premium study</p>
                      <p className="mt-0.5 text-xs leading-snug text-slate-500">Written for prayer and conversation—not another hot take.</p>
                    </div>
                  </div>
                  <div className="space-y-4">{blocks}</div>
                </div>
              </div>
            );
          })()
        ) : null}
      </div>
    </article>
  );
}
