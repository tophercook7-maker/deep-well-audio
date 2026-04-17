import Link from "next/link";
import type { Route } from "next";
import { getTopicPack } from "@/lib/topic-packs";
import type { ResolvedTopicPackSection } from "@/lib/topic-pack-resolve";
import { PremiumFeatureGate } from "@/components/premium/premium-feature-gate";
import { TopicPackPremiumFallback } from "@/components/monetization/topic-pack-premium-fallback";

function PathStepCard({
  section,
  step,
  anchorId,
}: {
  section: ResolvedTopicPackSection;
  step: number;
  anchorId?: string;
}) {
  return (
    <div id={anchorId} className="scroll-mt-28">
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-sm font-semibold text-amber-100">
            {step}
          </span>
          <span className="mt-1 w-px flex-1 min-h-[2rem] bg-gradient-to-b from-accent/35 to-transparent" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pb-8">
          <h3 className="text-lg font-semibold text-white">{section.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{section.description}</p>
          <ol className="mt-4 space-y-2.5 border-l border-line/60 pl-4 text-sm text-slate-200">
            {section.episodes.map((row, idx) => (
              <li key={`${row.displayTitle}-${idx}`} className="leading-snug">
                {row.episodeId ? (
                  <Link href={`/episodes/${row.episodeId}` as Route} className="text-amber-100/90 hover:text-amber-50 hover:underline">
                    {row.displayTitle}
                  </Link>
                ) : (
                  <span className="text-slate-400">{row.displayTitle}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function StructuredPack({
  firstSection,
  restSections,
  startHref,
}: {
  firstSection: ResolvedTopicPackSection;
  restSections: ResolvedTopicPackSection[];
  startHref: Route;
}) {
  const hasLinkedEpisode = firstSection.episodes.some((e) => e.episodeId);

  return (
    <>
      <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-200">Start here when you want a guide—not another endless scroll.</p>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <Link
              href={startHref}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
            >
              Start this path
            </Link>
            {!hasLinkedEpisode ? (
              <span className="text-center text-[11px] text-muted sm:text-right">Links fill in as episodes match this topic in your catalog.</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        <PathStepCard section={firstSection} step={1} anchorId="topic-pack-start" />
      </div>

      <PremiumFeatureGate feature="topic_packs" fallback={<TopicPackPremiumFallback />}>
        <div className="mt-2 space-y-2">
          {restSections.map((section, i) => (
            <PathStepCard key={section.id} section={section} step={i + 2} />
          ))}
        </div>
      </PremiumFeatureGate>
    </>
  );
}

/** Legacy flat pack (discernment, suffering, theology). */
function LegacyTopicPackSection({
  teaserTitles,
  curated,
}: {
  teaserTitles: string[];
  curated: { title: string; episodeId?: string }[];
}) {
  return (
    <>
      <div className="mt-5 rounded-2xl border border-line/70 bg-soft/15 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/55">Preview</p>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-200">
          {teaserTitles.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <PremiumFeatureGate feature="topic_packs" fallback={<TopicPackPremiumFallback />}>
        <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/[0.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/70">Your curated track</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-100">
            {curated.map((row, idx) => (
              <li key={`${row.title}-${idx}`}>
                {row.episodeId ? (
                  <Link href={`/episodes/${row.episodeId}` as Route} className="hover:text-amber-100 hover:underline">
                    {row.title}
                  </Link>
                ) : (
                  <span className="text-slate-300">{row.title}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </PremiumFeatureGate>
    </>
  );
}

type Props = {
  topicSlug: string;
  resolvedSections: ResolvedTopicPackSection[] | null;
};

export function TopicPackSection({ topicSlug, resolvedSections }: Props) {
  const pack = getTopicPack(topicSlug);
  if (!pack) return null;

  const isStructured = Boolean(pack.sections?.length && resolvedSections && resolvedSections.length);

  return (
    <section id={pack.packSlug} className="mt-10 scroll-mt-28 border-t border-line/50 pt-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/70">
        Topic pack · {pack.packSlug}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{pack.label}</h2>
      {pack.pathIntro ? (
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-amber-200/55">{pack.pathIntro}</p>
      ) : null}
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">{pack.description}</p>

      {isStructured && resolvedSections ? (
        <div className="mt-8 space-y-6">
          <StructuredPack
            firstSection={resolvedSections[0]!}
            restSections={resolvedSections.slice(1)}
            startHref={(() => {
              const id = resolvedSections[0]!.episodes.find((e) => e.episodeId)?.episodeId;
              return id ? (`/episodes/${id}` as Route) : (`/topics/${topicSlug}#topic-pack-start` as Route);
            })()}
          />
        </div>
      ) : pack.teaserTitles && pack.curated ? (
        <div className="mt-6">
          <LegacyTopicPackSection teaserTitles={pack.teaserTitles} curated={pack.curated} />
        </div>
      ) : null}
    </section>
  );
}
