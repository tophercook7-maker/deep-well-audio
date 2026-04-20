import Link from "next/link";
import type { Route } from "next";
import { Globe } from "lucide-react";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { CTA } from "@/lib/site-messaging";
import type { CuratedVideoItem } from "@/lib/curated-teachings/types";
import type { UserPlan } from "@/lib/permissions";
import { CuratedVideoGridWithStudy } from "@/components/curated-teachings/curated-video-grid-with-study";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { WorldWatchHomePreview } from "@/components/home/world-watch-home-preview";
import type { WorldWatchItemPublic } from "@/lib/world-watch/items";

type Props = {
  youtubeItems: CuratedVideoItem[];
  digestItems: WorldWatchItemPublic[];
  plan: UserPlan;
};

/**
 * Homepage anchor for World Watch: optional YouTube row plus digest preview.
 */
const HOME_WW_YOUTUBE_CAP = 3;

export function HomeWorldWatchHub({ youtubeItems, digestItems, plan }: Props) {
  const ytShow = youtubeItems.slice(0, HOME_WW_YOUTUBE_CAP);

  return (
    <section className="container-shell section-divider scroll-mt-28 py-10 sm:py-12" aria-labelledby="home-ww-hub-heading">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-line/50 bg-gradient-to-br from-soft/[0.14] via-bg/92 to-bg/95 p-6 shadow-[0_28px_72px_-44px_rgba(0,0,0,0.82)] sm:p-8">
        <div
          className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-amber-400/[0.06] blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="max-w-3xl">
            <h2 id="home-ww-hub-heading" className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Pay attention without getting pulled in
            </h2>
            <div className="mt-5 space-y-4 text-base leading-[1.65] text-slate-300/95 sm:text-[1.0625rem]">
              <p>The world moves fast. Most of it is hard to process in real time.</p>
              <p>World Watch slows it down.</p>
              <p>
                It gathers a small number of stories and holds them still long enough to understand what&apos;s happening—and how to think about it.
              </p>
            </div>
          </div>

          {ytShow.length > 0 ? (
            <div className="mt-8">
              <p className="text-sm leading-snug text-slate-400">A few clips to help you see clearly.</p>
              <div className="mt-4">
                <CuratedVideoGridWithStudy
                  items={ytShow}
                  plan={plan}
                  loginNext="/world-watch"
                  premiumTeaser={false}
                  thumbnailPriorityFirstN={1}
                  revealDelayMs={50}
                  gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                />
              </div>
              {plan !== "premium" ? (
                <p className="mt-5 text-sm leading-relaxed text-slate-400">
                  Premium unlocks the full World Watch written digest and deeper context—clips stay open to everyone.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-line/60 bg-soft/10 p-5">
                <div className="flex gap-3">
                  <Globe className="h-5 w-5 shrink-0 text-slate-500" aria-hidden />
                  <p className="text-sm leading-relaxed text-slate-400">
                    Clips load when available. The written digest preview below is unchanged.
                  </p>
                </div>
              </div>
              {plan !== "premium" ? (
                <p className="text-sm leading-relaxed text-slate-400">
                  Premium unlocks the full World Watch written digest—clips stay open to everyone when available.
                </p>
              ) : null}
            </div>
          )}

          <div className="mt-10 border-t border-line/40 pt-8">
            <RevealOnScroll delayMs={80}>
              <WorldWatchHomePreview items={digestItems} embedded />
            </RevealOnScroll>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-line/40 pt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={"/world-watch" as Route}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_-8px_rgba(212,175,55,0.35)] transition hover:opacity-95"
            >
              Open World Watch
            </Link>
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="view_plans_click"
              funnelData={{ placement: "home_world_watch_hub" }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white"
            >
              {CTA.SEE_PREMIUM}
            </FunnelLink>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-[1.65] text-slate-400">
            You don&apos;t have to keep up with everything.
            <br />
            Just stay grounded in what matters.
          </p>
        </div>
      </div>
    </section>
  );
}
