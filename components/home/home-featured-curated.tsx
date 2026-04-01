import Link from "next/link";
import type { Route } from "next";
import type { CuratedVideoItem } from "@/lib/curated-teachings/types";
import type { UserPlan } from "@/lib/permissions";
import { CuratedSectionShell } from "@/components/home/curated-section-shell";
import { CuratedVideoGridWithStudy } from "@/components/curated-teachings/curated-video-grid-with-study";

type Props = {
  items: CuratedVideoItem[];
  plan: UserPlan;
};

export function HomeFeaturedCurated({ items, plan }: Props) {
  if (items.length === 0) return null;

  return (
    <section
      className="container-shell section-divider scroll-mt-28 py-10 sm:py-12"
      aria-labelledby="home-featured-curated-heading"
    >
      <CuratedSectionShell>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-200/70">Curated teachings</p>
            <h2 id="home-featured-curated-heading" className="mt-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Featured Biblical Teaching
            </h2>
            <p className="mt-3.5 max-w-prose text-sm leading-[1.7] text-slate-400 sm:text-[0.9375rem]">
              A small, rotating selection from channels we trust—meant to invite reflection, not scrolling.{" "}
              {plan === "guest" ? (
                <span className="text-slate-500">Sign in to continue where you left off and access member-only features.</span>
              ) : null}
            </p>
          </div>
          <Link
            href={"/curated-teachings" as Route}
            className="shrink-0 self-start rounded-full border border-line/70 bg-soft/20 px-4 py-2.5 text-sm font-medium text-amber-100/90 transition hover:border-accent/40 hover:bg-accent/[0.08] sm:self-auto"
          >
            Full library →
          </Link>
        </div>

        <CuratedVideoGridWithStudy items={items} plan={plan} loginNext="/" thumbnailPriorityFirstN={1} />
      </CuratedSectionShell>
    </section>
  );
}
