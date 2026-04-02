import Link from "next/link";
import type { Route } from "next";
import { Globe, Radar } from "lucide-react";
import { BackButton } from "@/components/buttons/back-button";
import { ConversionPageBeacon } from "@/components/analytics/conversion-page-beacon";
import { WorldWatchPremium } from "@/components/world-watch/world-watch-premium";
import { WorldWatchTeaser } from "@/components/world-watch/world-watch-teaser";
import { WorldWatchVideoLensShell } from "@/components/world-watch/world-watch-video-lens-shell";
import { WorldWatchVideoLensGrid } from "@/components/world-watch/world-watch-video-lens-grid";
import { getUserPlan } from "@/lib/auth";
import { createServiceClient } from "@/lib/db";
import { canUseFeature } from "@/lib/permissions";
import { fetchPublishedWorldWatchItems } from "@/lib/world-watch/items";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { getWorldWatchYoutubeVideos } from "@/lib/curated-teachings/aggregate";

export const metadata = {
  title: "World Watch",
  description:
    "World Watch: a slower read on a few stories—video lens plus, for members, a full written digest with Scripture and notes. Think before reacting; stay grounded.",
};

export const dynamic = "force-dynamic";

function HeroBody() {
  return (
    <div className="mt-3 space-y-4 text-sm leading-relaxed text-slate-200/95 sm:mt-4 sm:text-base">
      <p>
        The news moves fast and speaks loud.
        <br />
        Most of it is built to keep you reacting.
      </p>
      <p>This is a slower read.</p>
      <p>
        World Watch gathers a small number of stories and holds them in place long enough to think about them.
        <br />
        Not to win arguments. Not to predict outcomes.
        <br />
        To understand what is happening and stay grounded in it.
      </p>
    </div>
  );
}

export default async function WorldWatchPage() {
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    plan = await getUserPlan();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  const premium = canUseFeature("world_watch", plan);

  let worldWatchItems: Awaited<ReturnType<typeof fetchPublishedWorldWatchItems>> = [];
  if (premium) {
    const admin = createServiceClient();
    if (admin) {
      worldWatchItems = await fetchPublishedWorldWatchItems(admin, 50, { audience: "premium" });
    } else {
      console.warn("[world-watch] service role unavailable — premium feed empty");
    }
  }

  const youtubePool = await getWorldWatchYoutubeVideos(48).catch((err) => {
    console.error("world-watch youtube:", err instanceof Error ? err.message : err);
    return [];
  });
  const ytCap = plan === "premium" ? youtubePool.length : plan === "free" ? 12 : 4;
  const youtubeItems = youtubePool.slice(0, ytCap);

  if (process.env.NODE_ENV === "development" || process.env.WORLD_WATCH_SERVER_LENS_LOG === "1") {
    console.info("[world-watch] video lens (server)", {
      plan,
      pool: youtubePool.length,
      ytCap,
      shown: youtubeItems.length,
    });
  }

  return (
    <main className="container-shell max-w-3xl space-y-6 py-8 max-md:space-y-3.5 max-md:py-6 sm:space-y-12 sm:py-12 lg:max-w-5xl lg:space-y-14 lg:py-16">
      <ConversionPageBeacon page="world_watch" />
      <div className="border-b border-line/50 pb-4 max-md:pb-2.5 sm:pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500/75">This week</p>

      <header className="flex flex-col gap-2.5 sm:gap-4 sm:flex-row sm:items-start">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent sm:h-12 sm:w-12">
          <Globe className="h-[1.15rem] w-[1.15rem] sm:h-6 sm:w-6" aria-hidden />
        </div>
        <div className="min-w-0 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">World Watch</p>
          <h1 className="mt-0.5 text-2xl font-semibold leading-snug tracking-tight text-white sm:mt-1 sm:text-3xl md:text-[2rem] md:leading-tight">
            See what&apos;s happening—without getting pulled into it
          </h1>
          <p className="mt-2 max-w-xl text-sm font-normal leading-relaxed text-slate-400/92 sm:mt-2.5 sm:text-[0.9375rem]">
            News you can think about without being pulled into it
          </p>
          {premium ? (
            <>
              <HeroBody />
              <p className="mt-4 text-sm text-slate-300/95">
                Below is your full digest for members. Need billing help?{" "}
                <Link href={"/feedback" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
                  Contact us
                </Link>
                .
              </p>
            </>
          ) : (
            <HeroBody />
          )}
        </div>
      </header>

      <section
        className="space-y-2.5 rounded-xl border border-rose-500/18 bg-gradient-to-br from-rose-950/11 via-[rgba(11,18,32,0.22)] to-[rgba(10,14,22,0.16)] p-3 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)] backdrop-blur-md max-md:rounded-lg sm:space-y-5 sm:rounded-[1.5rem] sm:p-8"
        aria-labelledby="ww-video-lens"
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-400/35 bg-rose-500/10 text-rose-100 sm:h-10 sm:w-10 sm:rounded-xl">
            <Radar className="h-3.5 w-3.5 sm:h-5 sm:w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p id="ww-video-lens" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-200/75 sm:text-xs">
              Video lens
            </p>
            <p className="mt-1 text-[11px] leading-snug text-slate-200/95 md:hidden">
              A few clips from voices worth listening to. Not everything—just enough to see clearly.
              {!premium ? (
                <>
                  {" "}
                  <span className="text-slate-300/90">Members get the full set.</span>
                </>
              ) : null}
            </p>
            <p className="mt-1.5 hidden text-sm leading-relaxed text-slate-200/95 md:block sm:mt-2">
              A few clips from voices worth listening to. Not everything—just enough to see clearly.
              {!premium ? <span className="text-slate-300/90"> Members get the full set.</span> : null}
            </p>
          </div>
        </div>
        {youtubeItems.length > 0 ? (
          <WorldWatchVideoLensShell serverPool={youtubePool.length} serverShown={youtubeItems.length} plan={plan}>
            <WorldWatchVideoLensGrid
              items={youtubeItems}
              plan={plan}
              loginNext="/world-watch"
              premiumTeaser={!premium}
              thumbnailPriorityFirstN={1}
            />
          </WorldWatchVideoLensShell>
        ) : (
          <div className="rounded-2xl border border-line/60 bg-soft/10 p-5">
            <div className="flex gap-3">
              <Globe className="h-5 w-5 shrink-0 text-rose-200/60" aria-hidden />
              <div className="text-sm leading-relaxed text-slate-200/95">
                <p>
                  No video picks loaded yet—feeds may still be warming, or{" "}
                  <code className="rounded bg-soft px-1 py-0.5 font-mono text-xs text-slate-300">YOUTUBE_API_KEY</code>{" "}
                  may be unset in production (RSS fallback should still run). Operators can warm caches with{" "}
                  <code className="rounded bg-soft px-1 py-0.5 font-mono text-[0.65rem] text-slate-300">
                    GET /api/cron/curated-youtube
                  </code>{" "}
                  using{" "}
                  <code className="rounded bg-soft px-1 py-0.5 font-mono text-xs text-slate-300">CRON_SECRET</code>.
                </p>
                <p className="mt-2 text-xs text-slate-400/95">Written World Watch below is unchanged when video rows are quiet.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {premium ? (
        <WorldWatchPremium items={worldWatchItems} />
      ) : (
        <>
          <div className="hidden md:block">
            <WorldWatchTeaser />
          </div>
          <div className="md:hidden">
            <WorldWatchTeaser omitLead />
          </div>
        </>
      )}
    </main>
  );
}
