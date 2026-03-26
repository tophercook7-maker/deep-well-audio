import Link from "next/link";
import type { Route } from "next";
import { getTopicPack } from "@/lib/topic-packs";
import { PremiumFeatureGate } from "@/components/premium/premium-feature-gate";
import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";

export function TopicPackSection({ topicSlug }: { topicSlug: string }) {
  const pack = getTopicPack(topicSlug);
  if (!pack) return null;

  return (
    <section className="mt-10 border-t border-line/50 pt-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/70">Topic pack</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{pack.label}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{pack.description}</p>

      <div className="mt-5 rounded-2xl border border-line/70 bg-soft/15 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/55">Preview</p>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-slate-200">
          {pack.teaserTitles.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <PremiumFeatureGate
        feature="topic_packs"
        fallback={
          <div className="mt-5 rounded-2xl border border-dashed border-line/75 bg-bg/50 p-5 text-center">
            <p className="text-sm font-medium text-slate-200">Curated listen order</p>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted">
              Premium unlocks the full ordered list for this topic. Episode links appear when UUIDs are set in{" "}
              <code className="rounded bg-soft px-1 text-[11px]">lib/topic-packs.ts</code>.
            </p>
            <PremiumUpgradeActions className="mt-5" />
          </div>
        }
      >
        <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/[0.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/70">Your curated track</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-100">
            {pack.curated.map((row, idx) => (
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
    </section>
  );
}
