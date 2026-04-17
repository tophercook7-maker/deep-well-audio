import { getHomeRecentEpisodes, getActiveShowCount, getPublicEpisodeCount } from "@/lib/queries";
import { HomeSetupStatusPanel } from "@/components/home-setup-status";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import type { EpisodeWithShow } from "@/lib/types";
import { SimplifiedHome } from "@/components/home/simplified-home";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { fetchWorldWatchTeaserForRetention } from "@/lib/world-watch/teaser-for-retention";

const HOMEPAGE_RECENT_SAMPLES = 8;

export default async function HomePage() {
  let recentPool: EpisodeWithShow[] = [];
  let showCount = 0;
  let episodeCount = 0;
  const user = await getSessionUser();
  const plan = await getUserPlan();
  let wwTeaser: Awaited<ReturnType<typeof fetchWorldWatchTeaserForRetention>> = null;
  try {
    const [recentPoolRes, showCountRes, episodeCountRes, wwRes] = await Promise.all([
      getHomeRecentEpisodes(HOMEPAGE_RECENT_SAMPLES),
      getActiveShowCount(),
      getPublicEpisodeCount(),
      user ? fetchWorldWatchTeaserForRetention() : Promise.resolve(null),
    ]);
    recentPool = recentPoolRes;
    showCount = showCountRes;
    episodeCount = episodeCountRes;
    wwTeaser = wwRes;
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("page home:", e instanceof Error ? e.message : e);
  }

  const hasContent = recentPool.length > 0;

  return (
    <main>
      <SimplifiedHome
        startListening={recentPool}
        showCount={showCount}
        episodeCount={episodeCount}
        sessionUser={Boolean(user)}
        plan={plan}
        worldWatchLatest={
          wwTeaser
            ? { id: wwTeaser.id, title: wwTeaser.title, slug: wwTeaser.slug, published_at: wwTeaser.published_at }
            : null
        }
      />

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
