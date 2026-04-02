import type { Route } from "next";
import type { CuratedVideoItem } from "@/lib/curated-teachings/types";
import type { UserPlan } from "@/lib/permissions";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { CuratedVideoCard } from "@/components/curated-teachings/curated-video-card";
import { HOME_GUIDED_PATH_ENTRIES } from "@/lib/home-guided-path-entries";

type Props = {
  plan: UserPlan;
  /** When set, this single teaching is shown; otherwise the first homepage guided path is shown. */
  featuredVideo: CuratedVideoItem | null;
};

export function HomeStartHereToday({ plan, featuredVideo }: Props) {
  const guided = HOME_GUIDED_PATH_ENTRIES[0];

  return (
    <section className="container-shell section-divider py-10 sm:py-12" aria-labelledby="home-start-here-heading">
      <div className="max-w-2xl">
        <h2 id="home-start-here-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Start here today
        </h2>
        <p className="mt-4 text-base leading-[1.65] text-slate-200/95">
          You don&apos;t need to take everything in.
          <br />
          Just start with one thing.
        </p>
      </div>

      <div className="mt-8 max-w-xl">
        {featuredVideo ? (
          <CuratedVideoCard
            item={featuredVideo}
            plan={plan}
            thumbnailPriority
            showCategory={false}
            hideExcerpt
          />
        ) : (
          <FunnelLink
            href={`/paths/${guided.slug}` as Route}
            funnelEvent="guided_path_click"
            funnelData={{ slug: guided.slug, placement: "start_here_today" }}
            className="group flex min-h-[3.25rem] items-center rounded-2xl border border-line/80 bg-[rgba(15,20,28,0.42)] px-4 py-3.5 no-underline outline-none transition duration-200 hover:border-accent/40 hover:bg-accent/[0.06] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <span className="font-medium text-white group-hover:text-amber-100/95">{guided.label}</span>
          </FunnelLink>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500/65">Come back tomorrow.</p>
      </div>
    </section>
  );
}
