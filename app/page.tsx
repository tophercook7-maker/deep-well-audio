import { getActiveShowCount, getFeaturedShows, getHomeRecentEpisodes, getPublicEpisodeCount } from "@/lib/queries";
import { HomeSetupStatusPanel } from "@/components/home-setup-status";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { getUserPlan } from "@/lib/auth";
import { canUseFeature } from "@/lib/permissions";
import { ContinueListeningSection } from "@/components/listening/continue-listening";
import { RecentlyPlayedSection } from "@/components/listening/recently-played";
import { createServiceClient } from "@/lib/db";
import { fetchPublishedWorldWatchItems } from "@/lib/world-watch/items";
import type { WorldWatchItemPublic } from "@/lib/world-watch/items";
import { PremiumHome } from "@/components/home/premium-home";
import type { EpisodeWithShow, ShowWithMeta } from "@/lib/types";

const HOMEPAGE_FEATURED_CHIP_LIMIT = 24;
const HOMEPAGE_RECENT_SAMPLES = 6;
/** Digest preview: lead + supporting card. */
const HOMEPAGE_WW_DIGEST = 2;

export default async function HomePage() {
  let featured: ShowWithMeta[] = [];
  let recentPool: EpisodeWithShow[] = [];
  let showCount = 0;
  let episodeCount = 0;
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  let worldWatchDigest: WorldWatchItemPublic[] = [];
  try {
    const adminClient = createServiceClient();
    const [featuredRes, recentPoolRes, showCountRes, episodeCountRes, planRes, worldWatchDigestRes] = await Promise.all([
      getFeaturedShows(HOMEPAGE_FEATURED_CHIP_LIMIT),
      getHomeRecentEpisodes(HOMEPAGE_RECENT_SAMPLES),
      getActiveShowCount(),
      getPublicEpisodeCount(),
      getUserPlan(),
      adminClient
        ? fetchPublishedWorldWatchItems(adminClient, HOMEPAGE_WW_DIGEST, { audience: "teaser" }).catch((err) => {
            console.error("home world watch preview:", err instanceof Error ? err.message : err);
            return [] as WorldWatchItemPublic[];
          })
        : Promise.resolve([] as WorldWatchItemPublic[]),
    ]);
    featured = featuredRes;
    recentPool = recentPoolRes;
    showCount = showCountRes;
    episodeCount = episodeCountRes;
    plan = planRes;
    worldWatchDigest = worldWatchDigestRes;
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("page home:", e instanceof Error ? e.message : e);
  }
  const showSessionListening = canUseFeature("continue_listening", plan);
  const hasContent = featured.length > 0 || recentPool.length > 0;

  return (
    <main>
      <PremiumHome
        plan={plan}
        featuredShows={featured}
        savedEpisodeSamples={recentPool}
        worldWatchItems={worldWatchDigest}
        episodeCount={episodeCount}
        showCount={showCount}
      />

      <ContinueListeningSection enabled={showSessionListening} />
      <RecentlyPlayedSection enabled={showSessionListening} />

      {!hasContent && showCount === 0 ? (
        <section className="container-shell py-10">
          <div className="card border-accent/25 bg-accent/5 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">First-time setup</p>
            <h2 className="mt-3 text-2xl font-semibold">You&apos;re one sync away from a full directory</h2>
            <p className="mt-3 max-w-2xl text-muted">
              With Supabase connected, run a protected RSS sync. Episodes and artwork will land in your project automatically from the feeds in{" "}
              <code className="rounded bg-soft px-1 text-xs text-slate-200">data/source-feeds.ts</code>.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-line bg-bg p-4 text-xs text-slate-200">
              curl -X POST -H &quot;Authorization: Bearer $SYNC_API_SECRET&quot; http://localhost:3000/api/sync/all
            </pre>
          </div>
        </section>
      ) : null}

      <HomeSetupStatusPanel showCount={showCount} />
    </main>
  );
}
