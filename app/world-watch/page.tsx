import type { Route } from "next";
import Link from "next/link";
import { Check, Globe, Lock, Radar } from "lucide-react";
import { CTA } from "@/lib/site-messaging";
import { BackButton } from "@/components/buttons/back-button";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { FunnelLink } from "@/components/analytics/funnel-link";
import { WorldWatchPremium } from "@/components/world-watch/world-watch-premium";
import { WorldWatchItemCard } from "@/components/world-watch/world-watch-item-card";
import { WorldWatchVideoLensShell } from "@/components/world-watch/world-watch-video-lens-shell";
import { WorldWatchVideoLensGrid } from "@/components/world-watch/world-watch-video-lens-grid";
import { getUserPlan } from "@/lib/auth";
import { createServiceClient } from "@/lib/db";
import { canUseFeature } from "@/lib/permissions";
import { fetchPublishedWorldWatchItems } from "@/lib/world-watch/items";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { getWorldWatchYoutubeVideos } from "@/lib/curated-teachings/aggregate";
import { WorldWatchVisitTracker } from "@/components/world-watch/world-watch-visit-tracker";

export const metadata = {
  title: "World Watch",
  description:
    "A current-events resource from a Christian worldview. Public previews and videos help listeners stay informed with wisdom and discernment.",
};

export const dynamic = "force-dynamic";

const TEASER_PREVIEW_COUNT = 3;

export default async function WorldWatchPage() {
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    plan = await getUserPlan();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const premium = canUseFeature("world_watch", plan);
  const admin = createServiceClient();

  let worldWatchItems: Awaited<ReturnType<typeof fetchPublishedWorldWatchItems>> = [];
  let teaserItems: Awaited<ReturnType<typeof fetchPublishedWorldWatchItems>> = [];

  if (premium && admin) {
    worldWatchItems = await fetchPublishedWorldWatchItems(admin, 50, { audience: "premium" });
  } else if (admin) {
    teaserItems = await fetchPublishedWorldWatchItems(admin, TEASER_PREVIEW_COUNT, { audience: "teaser" });
  }

  const youtubePool = await getWorldWatchYoutubeVideos(48).catch((err) => {
    console.error("world-watch youtube:", err instanceof Error ? err.message : err);
    return [];
  });
  /** Third-party YouTube clips stay open to everyone; written digest depth is layered below. */
  const youtubeItems = youtubePool;

  return (
    <main className="container-shell max-w-3xl space-y-10 py-10 sm:space-y-14 sm:py-14 lg:max-w-5xl">
      <WorldWatchVisitTracker />
      <ConversionPageBeacon page="world_watch" />
      <div className="border-b border-line/50 pb-4 sm:pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="space-y-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
          <Globe className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">World Watch</h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-300/95 sm:text-lg">
          World Watch is a current-events resource from a Christian worldview. Public previews and videos are available
          here to help listeners stay informed with wisdom and discernment.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Go deeper with the full World Watch digest, commentary, and discernment notes with Premium.
        </p>
      </header>

      <section
        className="rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.42)] p-6 backdrop-blur-md sm:p-8"
        aria-labelledby="ww-what-heading"
      >
        <h2 id="ww-what-heading" className="text-lg font-semibold text-white">
          What stays open
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-400/95">
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Public video clips and external watch links
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Public previews of written entries when available
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Scripture-grounded context without requiring an account
          </li>
        </ul>
        <p className="mt-5 text-sm text-slate-500">
          Premium adds the full written digest, commentary, and discernment notes. The page itself remains public.
        </p>
      </section>

      <section
        className="space-y-4 rounded-2xl border border-rose-500/18 bg-gradient-to-br from-rose-950/11 via-[rgba(11,18,32,0.22)] to-[rgba(10,14,22,0.16)] p-5 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)] backdrop-blur-md sm:space-y-5 sm:rounded-[1.5rem] sm:p-8"
        aria-labelledby="ww-video-lens"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/35 bg-rose-500/10 text-rose-100">
            <Radar className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p id="ww-video-lens" className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200/75">
              Video lens
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-200/95">
              Clips from trusted channels are available to everyone. Open a card to watch inline or follow the public source link.
            </p>
          </div>
        </div>
        {youtubeItems.length > 0 ? (
          <WorldWatchVideoLensShell serverPool={youtubePool.length} serverShown={youtubeItems.length} plan={plan}>
            <WorldWatchVideoLensGrid
              items={youtubeItems}
              plan={plan}
              loginNext="/world-watch"
              premiumTeaser={false}
              thumbnailPriorityFirstN={1}
            />
          </WorldWatchVideoLensShell>
        ) : (
          <div className="rounded-2xl border border-line/60 bg-soft/10 p-5 text-sm text-muted">
            Video picks load when feeds are available. Public previews below remain available when this section is quiet.
          </div>
        )}
      </section>

      {premium ? (
        <WorldWatchPremium items={worldWatchItems} />
      ) : (
        <>
          <section className="space-y-6" aria-labelledby="ww-preview-heading">
            <h2 id="ww-preview-heading" className="text-lg font-semibold text-white">
              Public previews
            </h2>
            {teaserItems.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-3">
                {teaserItems.map((item) => (
                  <WorldWatchItemCard key={item.id} item={item} maxSummaryParagraphs={2} showReflection={false} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-line/60 bg-soft/10 p-5 text-sm text-muted">
                Public written previews will appear here when published. Video picks above stay available without signing in.
              </p>
            )}
          </section>

          <section
            className="relative overflow-hidden rounded-[22px] border border-line/50 bg-[rgba(6,9,14,0.65)]"
            aria-labelledby="ww-premium-heading"
          >
            <div className="relative space-y-5 p-8 sm:p-10">
              <div className="flex items-center gap-3 text-accent">
                <Lock className="h-6 w-6" aria-hidden />
                <h2 id="ww-premium-heading" className="text-xl font-semibold text-white">
                  Go deeper with Premium
                </h2>
              </div>
              <p className="max-w-xl text-base font-medium leading-relaxed text-slate-100/95">
                Go deeper with the full World Watch digest, commentary, and discernment notes with Premium.
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-slate-400">
                Public previews and videos stay open. Premium adds the complete written layer for people who want richer context over time.
              </p>
              <FunnelLink
                href={"/pricing" as Route}
                funnelEvent="view_plans_click"
                funnelData={{ placement: "world_watch_premium_layer" }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
              >
                {CTA.SEE_PREMIUM}
              </FunnelLink>
              <p className="text-xs text-slate-500">
                Already Premium?{" "}
                <Link href="/login?next=/world-watch" className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
                  Sign in
                </Link>{" "}
                to see the full digest.
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
