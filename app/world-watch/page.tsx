import Link from "next/link";
import type { Route } from "next";
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
    "A calmer, Scripture-grounded read on what is happening—summaries and reflection without sensationalism. Preview free; full digest with Premium.",
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
  /** Third-party YouTube clips: same pool for all plans (written digest above/below stays premium/teaser). */
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
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Understand the world without being shaped by its noise.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-300/95 sm:text-lg">
          World Watch gives you a calmer, Scripture-grounded way to follow what&apos;s happening.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Stories publish on a rolling rhythm—meant for discernment, not alarm.
        </p>
      </header>

      <section
        className="rounded-[22px] border border-line/50 bg-[rgba(9,12,18,0.42)] p-6 backdrop-blur-md sm:p-8"
        aria-labelledby="ww-what-heading"
      >
        <h2 id="ww-what-heading" className="text-lg font-semibold text-white">
          What you get
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-400/95">
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Clear summaries of important stories
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Scripture connected to real events
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            Teaching that helps you think biblically
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            A slower, more grounded pace
          </li>
        </ul>
        <p className="mt-5 text-sm text-slate-500">
          <span className="font-medium text-slate-400/95">Premium</span> adds the full written digest, deeper commentary, and richer connections
          across entries.
        </p>
      </section>

      {!premium ? (
        <section className="space-y-6" aria-labelledby="ww-preview-heading">
          <h2 id="ww-preview-heading" className="text-lg font-semibold text-white">
            Preview
          </h2>
          {teaserItems.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {teaserItems.map((item) => (
                <WorldWatchItemCard key={item.id} item={item} maxSummaryParagraphs={2} showReflection={false} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-line/60 bg-soft/10 p-5 text-sm text-muted">
              Written digest entries will appear here when published. Video picks below stay available as a light preview.
            </p>
          )}
        </section>
      ) : null}

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
              Clips from trusted channels—available to everyone. Premium below adds the full written digest and deeper context.
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
            Video picks load when feeds are available. The written digest below is unchanged when this section is quiet.
          </div>
        )}
      </section>

      {premium ? (
        <WorldWatchPremium items={worldWatchItems} />
      ) : (
        <section
          className="relative overflow-hidden rounded-[22px] border border-line/50 bg-[rgba(6,9,14,0.65)]"
          aria-labelledby="ww-locked-heading"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="space-y-3 p-8 opacity-[0.35] blur-[5px]">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={[
                    "rounded-2xl border border-line/30 bg-soft/40",
                    i % 2 === 0 ? "h-24" : "h-14",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(8,11,17,0.25)] via-[rgba(8,11,17,0.65)] to-[rgba(5,7,12,0.94)] backdrop-blur-[1px]" />
          <div className="relative space-y-5 p-8 sm:p-10">
            <div className="flex items-center gap-3 text-accent">
              <Lock className="h-6 w-6" aria-hidden />
              <h2 id="ww-locked-heading" className="text-xl font-semibold text-white">
                Full World Watch
              </h2>
            </div>
            <p className="max-w-xl text-base font-medium leading-relaxed text-slate-100/95">
              Unlock full World Watch with Premium
            </p>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              Premium includes the complete written digest, deeper context, and a steadier read—continuity for the news you need to think about.
            </p>
            <FunnelLink
              href={"/pricing" as Route}
              funnelEvent="view_plans_click"
              funnelData={{ placement: "world_watch_lock" }}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_-10px_rgba(212,175,55,0.45)] transition hover:opacity-95"
            >
              {CTA.UPGRADE_TO_PREMIUM}
            </FunnelLink>
            <p className="text-xs text-slate-500">
              Already a member?{" "}
              <Link href="/login?next=/world-watch" className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
