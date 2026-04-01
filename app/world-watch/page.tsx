import { Globe, Radar } from "lucide-react";
import { BackButton } from "@/components/buttons/back-button";
import { WorldWatchPremium } from "@/components/world-watch/world-watch-premium";
import { WorldWatchMemberStudyCue } from "@/components/world-watch/world-watch-member-study-cue";
import { WorldWatchTeaser } from "@/components/world-watch/world-watch-teaser";
import { CuratedVideoGridWithStudy } from "@/components/curated-teachings/curated-video-grid-with-study";
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

  const youtubePool = await getWorldWatchYoutubeVideos(48).catch((err) => {
    console.error("world-watch youtube:", err instanceof Error ? err.message : err);
    return [];
  });
  const ytCap = plan === "premium" ? youtubePool.length : plan === "free" ? 12 : 4;
  const youtubeItems = youtubePool.slice(0, ytCap);

  return (
    <main className="container-shell max-w-3xl space-y-12 py-12 sm:space-y-14 sm:py-16 lg:max-w-5xl">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
          <Globe className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 max-w-prose">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">World Watch</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">World Watch</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            {premium ? (
              <>
                See current events, culture, and global developments through a biblical lens. Thoughtful, relevant, and intentionally curated—
                a quiet place to read, pray, and return when the headlines feel loud.
              </>
            ) : (
              <>
                See current events, culture, and global developments through a biblical lens. Thoughtful, relevant, and intentionally curated.
                The full written digest is{" "}
                <span className="text-slate-300">for Premium members</span>; below is a preview and how to join when you&apos;re ready.
              </>
            )}
          </p>
        </div>
      </header>

      {youtubeItems.length > 0 ? (
        <section className="space-y-5 rounded-[1.5rem] border border-rose-500/20 bg-gradient-to-br from-rose-950/20 via-bg/80 to-bg p-6 sm:p-8" aria-labelledby="ww-video-lens">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-400/35 bg-rose-500/10 text-rose-100">
              <Radar className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p id="ww-video-lens" className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-200/75">
                Video lens
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Curated clips from channels flagged for biblical cultural commentary.{" "}
                {!premium && youtubePool.length > youtubeItems.length ? (
                  <span className="text-slate-500">
                    Premium shows the full aggregated list; you&apos;re seeing a preview band.
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <CuratedVideoGridWithStudy
            items={youtubeItems}
            plan={plan}
            loginNext="/world-watch"
            premiumTeaser={!premium}
            thumbnailPriorityFirstN={1}
            gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          />
        </section>
      ) : null}

      {premium ? (
        <WorldWatchPremium items={worldWatchItems} />
      ) : (
        <>
          <WorldWatchMemberStudyCue />
          <WorldWatchTeaser />
        </>
      )}
    </main>
  );
}
