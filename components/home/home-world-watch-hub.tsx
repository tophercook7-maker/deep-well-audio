import Link from "next/link";
import type { Route } from "next";
import { Globe, Radar } from "lucide-react";
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
 * Homepage anchor for World Watch: optional YouTube “lens” row plus the existing digest preview.
 */
export function HomeWorldWatchHub({ youtubeItems, digestItems, plan }: Props) {
  /** Compact homepage preview: 2–3 items so WW feels intentional, not a thumbnail wall. */
  const ytCap = plan === "premium" ? 3 : plan === "free" ? 3 : 2;
  const ytShow = youtubeItems.slice(0, ytCap);

  return (
    <section className="container-shell section-divider scroll-mt-28 py-10 sm:py-12" aria-labelledby="home-ww-hub-heading">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-line/50 bg-gradient-to-br from-soft/[0.14] via-bg/92 to-bg/95 p-6 shadow-[0_28px_72px_-44px_rgba(0,0,0,0.82)] sm:p-8">
        <div
          className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-amber-400/[0.06] blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-accent/[0.08] text-amber-200/90">
              <Radar className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-200/65">World Watch</p>
              <h2 id="home-ww-hub-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Scripture, culture, and the moment we&apos;re in
              </h2>
              <p className="mt-3.5 text-sm leading-[1.7] text-slate-400 sm:text-[0.9375rem]">
                See current events, culture, and global developments through a biblical lens. Thoughtful, relevant, and intentionally curated—
                video picks alongside our written <span className="text-slate-300">World Watch</span> digest for members. Discernment-oriented,
                not generic news noise.
              </p>
            </div>
          </div>

          {ytShow.length > 0 ? (
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200/70">Video lens</p>
              <CuratedVideoGridWithStudy
                items={ytShow}
                plan={plan}
                loginNext="/world-watch"
                premiumTeaser={plan !== "premium"}
                thumbnailPriorityFirstN={1}
                revealDelayMs={50}
                gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              />
              {youtubeItems.length > ytCap ? (
                <p className="mt-4 text-xs text-slate-500">
                  {plan === "premium" ? (
                    <Link href={"/world-watch" as Route} className="text-amber-200/80 underline-offset-2 hover:underline">
                      Open World Watch for more video picks →
                    </Link>
                  ) : (
                    <>
                      <Link href={"/pricing" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
                        Premium
                      </Link>{" "}
                      unlocks the full World Watch video roster alongside written digests.
                    </>
                  )}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-line/60 bg-soft/10 p-5">
              <div className="flex gap-3">
                <Globe className="h-5 w-5 shrink-0 text-rose-200/60" aria-hidden />
                <p className="text-sm leading-relaxed text-slate-400">
                  Video picks load from editorially flagged sources; if a feed is temporarily unavailable, this row stays quiet on purpose.
                  The written digest preview below is unchanged.
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 border-t border-line/40 pt-8">
            <RevealOnScroll delayMs={80}>
              <WorldWatchHomePreview items={digestItems} embedded />
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
}
