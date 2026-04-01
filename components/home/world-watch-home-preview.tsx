import Link from "next/link";
import type { Route } from "next";
import { Globe } from "lucide-react";
import { WorldWatchItemCard } from "@/components/world-watch/world-watch-item-card";
import type { WorldWatchItemPublic } from "@/lib/world-watch/items";

type Props = {
  items: WorldWatchItemPublic[];
  /** When true, render inside another section (no outer `section` / divider). */
  embedded?: boolean;
};

/**
 * Homepage slice of World Watch: one lead + up to two supporting items, or a calm empty state.
 */
export function WorldWatchHomePreview({ items, embedded = false }: Props) {
  const [lead, a, b] = items;

  const inner = (
    <>
      {!embedded ? (
        <div className="mb-9 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">World Watch</p>
          <h2 id="home-world-watch-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Faith &amp; public life, without the noise
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-[1.65] text-slate-400 sm:text-base">
            A measured read—curated links, short context, room to pray. The full edition is{" "}
            <span className="text-slate-300">for Premium members</span>; a quiet preview below.
          </p>
        </div>
      ) : (
        <div className="mb-7 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Written digest</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Faith &amp; public life—member edition
          </h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-400">
            Curated reads from our team. Full archive with <span className="text-slate-300">Premium</span>.
          </p>
        </div>
      )}

      {lead ? (
        <div className="space-y-6 lg:space-y-8">
          <WorldWatchItemCard
            item={lead}
            variant="featured"
            maxSummaryParagraphs={2}
            showReflection={false}
          />
          {a || b ? (
            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
              {a ? (
                <WorldWatchItemCard key={a.id} item={a} maxSummaryParagraphs={1} showReflection={false} />
              ) : null}
              {b ? (
                <WorldWatchItemCard key={b.id} item={b} maxSummaryParagraphs={1} showReflection={false} />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="card border-line/85 bg-soft/[0.12] p-7 sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
              <Globe className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-[1.65] text-slate-400">
                New stories land after each digest.{" "}
                <Link
                  href={"/world-watch" as Route}
                  className="font-medium text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline"
                >
                  Open World Watch
                </Link>{" "}
                to see layout and Premium details.
              </p>
            </div>
          </div>
        </div>
      )}

      {!embedded ? (
        <div className="mt-9 flex flex-col gap-3 border-t border-line/40 pt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href={"/world-watch" as Route}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-accent/35 bg-accent/[0.08] px-5 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/50 hover:bg-accent/[0.12]"
          >
            Open World Watch
          </Link>
          <p className="text-xs leading-relaxed text-slate-400">Full edition in-app · Included with Premium</p>
        </div>
      ) : (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <Link
            href={"/world-watch" as Route}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-accent/35 bg-accent/[0.08] px-5 py-2.5 text-sm font-medium text-amber-100/95 transition hover:border-accent/50 hover:bg-accent/[0.12]"
          >
            Open World Watch
          </Link>
          <p className="text-xs leading-relaxed text-slate-500">Premium · Written digest + expanded picks</p>
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className="world-watch-home-preview-embedded">{inner}</div>;
  }

  return (
    <section
      className="container-shell section-divider scroll-mt-28 py-10 sm:py-12"
      aria-labelledby="home-world-watch-heading"
    >
      {inner}
    </section>
  );
}
