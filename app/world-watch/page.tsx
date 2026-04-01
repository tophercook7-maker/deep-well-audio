import { Globe, Radar } from "lucide-react";
import { BackButton } from "@/components/buttons/back-button";
import { WorldWatchPremium } from "@/components/world-watch/world-watch-premium";
import { WorldWatchMemberStudyCue } from "@/components/world-watch/world-watch-member-study-cue";
import { WorldWatchTeaser, WorldWatchTeaserLead } from "@/components/world-watch/world-watch-teaser";
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
    "Current events, culture, and global developments through a biblical lens—thoughtful, relevant, and intentionally curated on Deep Well Audio.",
};

export const dynamic = "force-dynamic";

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

  /**
   * Video lens data path is identical for guest / free / premium: one YouTube aggregate call.
   * Only `ytCap` (slice length) changes by plan; there is no alternate ingest or auth filter here.
   */
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
      <div className="border-b border-line/50 pb-4 max-md:pb-2.5 sm:pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="flex flex-col gap-2.5 sm:gap-4 sm:flex-row sm:items-start">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent sm:h-12 sm:w-12">
          <Globe className="h-[1.15rem] w-[1.15rem] sm:h-6 sm:w-6" aria-hidden />
        </div>
        <div className="min-w-0 max-w-prose">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">World Watch</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-white sm:mt-1 sm:text-4xl">World Watch</h1>
          {premium ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 md:hidden">
                A quiet read on current events through a biblical lens—curated, not a headline firehose.
              </p>
              <p className="mt-2 hidden text-sm leading-relaxed text-slate-300 sm:mt-3 sm:text-base md:block">
                See current events, culture, and global developments through a biblical lens. Thoughtful, relevant, and intentionally curated—a
                quiet place to read, pray, and return when the headlines feel loud.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 md:hidden">
                Faith &amp; public life, curated—preview clips below. Full written digest is{" "}
                <span className="text-slate-300">Premium</span>.
              </p>
              <p className="mt-2 hidden text-sm leading-relaxed text-slate-300 sm:mt-3 sm:text-base md:block">
                See current events, culture, and global developments through a biblical lens. Thoughtful, relevant, and intentionally curated.
                The full written digest is <span className="text-slate-200">for Premium members</span>; below is a preview and how to join when
                you&apos;re ready.
              </p>
            </>
          )}
        </div>
      </header>

      <section
        className="space-y-2.5 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-950/18 via-[rgba(11,18,32,0.32)] to-[rgba(10,14,22,0.24)] p-3 shadow-[0_20px_48px_-30px_rgba(0,0,0,0.45)] backdrop-blur-md max-md:rounded-lg sm:space-y-5 sm:rounded-[1.5rem] sm:p-8"
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
            <p className="mt-1 text-[11px] leading-snug text-slate-300 md:hidden">
              {premium ? (
                <>Clips from channels we trust for calm, faithful cultural commentary.</>
              ) : (
                <>
                  A short preview of curated commentary clips.
                  {youtubePool.length > youtubeItems.length ? (
                    <>
                      {" "}
                      <span className="text-slate-500">Premium: full list.</span>
                    </>
                  ) : null}
                </>
              )}
            </p>
            <p className="mt-1.5 hidden text-sm leading-relaxed text-slate-300 md:block sm:mt-2">
              Curated clips from channels flagged for biblical cultural commentary.
              {!premium && youtubePool.length > youtubeItems.length ? (
                <span className="text-slate-500"> Premium unlocks the full clip list.</span>
              ) : null}
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
              <div className="text-sm leading-relaxed text-slate-300">
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
                <p className="mt-2 text-xs text-slate-500">
                  Written World Watch below is unchanged when video rows are quiet.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {!premium ? (
        <div className="rounded-lg border border-line/45 bg-[rgba(12,16,24,0.42)] p-3 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden">
          <WorldWatchTeaserLead compact />
          <div className="mt-3 border-t border-line/40 pt-3">
            <WorldWatchMemberStudyCue compact />
          </div>
        </div>
      ) : null}

      {premium ? (
        <WorldWatchPremium items={worldWatchItems} />
      ) : (
        <>
          <div className="hidden space-y-8 md:block lg:space-y-10">
            <WorldWatchMemberStudyCue />
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
