import type { SupabaseClient } from "@supabase/supabase-js";
import { sourceFeeds } from "@/data/source-feeds";
import type { CatalogCyclePromotionResult } from "@/lib/catalog-cycles";
import { runPostSyncCyclePipeline } from "@/lib/catalog-cycles";
import { createServiceClient } from "@/lib/db";
import { getActiveRssSeeds, syncRssSeeds, type RssSyncSummary } from "@/lib/ingest/rss-sync";
import { getOptionalYoutubeApiKey } from "@/lib/env";
import { persistIngest } from "@/lib/persist";
import { fetchYoutubeIngest } from "@/lib/youtube";

export type SyncErrorRow = { feedTitle: string; feedUrl: string; error: string };

export type YoutubeSyncFeedResult = {
  slug: string;
  title: string;
  youtubeChannelId: string | null;
  ok: boolean;
  error?: string;
  inserted?: number;
  updated?: number;
  episodesTouched?: number;
};

export type SyncAllBody = {
  totalFeeds: number;
  feedsAttempted: number;
  feedsSucceeded: number;
  feedsFailed: number;
  episodesInserted: number;
  episodesUpdated: number;
  errors: SyncErrorRow[];
  ok: boolean;
  rss: RssSyncSummary | null;
  youtube: YoutubeSyncFeedResult[];
  youtubeSkipped: boolean;
  error?: string;
  cycle?: CatalogCyclePromotionResult | null;
};

export type RunSyncAllOptions = {
  slugFilter?: string;
  maxRssItems?: number;
  maxYoutubeItems?: number;
  /** When false, skip staged-cycle rebuild / promotion (manual slug-only sync). */
  runCyclePipeline?: boolean;
};

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function unconfiguredBody(totalRssConfigured: number): SyncAllBody {
  return {
    totalFeeds: totalRssConfigured,
    feedsAttempted: 0,
    feedsSucceeded: 0,
    feedsFailed: 0,
    episodesInserted: 0,
    episodesUpdated: 0,
    errors: [],
    error: "Database not configured for ingestion",
    ok: false,
    rss: null,
    youtube: [],
    youtubeSkipped: true,
  };
}

/**
 * Full catalog sync: RSS podcast/sermon feeds + optional YouTube channels from `data/source-feeds.ts`.
 * Persists to `shows` and `episodes` (not curated-teachings cache or World Watch written items).
 */
export async function runSyncAll(
  supabase: SupabaseClient,
  options: RunSyncAllOptions = {}
): Promise<SyncAllBody> {
  const slugFilter = options.slugFilter;
  const maxRssItems = options.maxRssItems ?? 50;
  const maxYoutubeItems = options.maxYoutubeItems ?? 25;
  const apiKey = getOptionalYoutubeApiKey();
  const totalRssConfigured = getActiveRssSeeds(sourceFeeds).length;

  console.log("sync all: start RSS configured count", totalRssConfigured, "slugFilter", slugFilter ?? "(none)");

  let rssSummary: RssSyncSummary;
  try {
    rssSummary = await syncRssSeeds(supabase, sourceFeeds, {
      maxItems: maxRssItems,
      slugFilter,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("sync all: RSS batch failed", message);
    return {
      totalFeeds: totalRssConfigured,
      feedsAttempted: 0,
      feedsSucceeded: 0,
      feedsFailed: 1,
      episodesInserted: 0,
      episodesUpdated: 0,
      errors: [{ feedTitle: "(rss batch)", feedUrl: "", error: message }],
      error: `RSS sync failed: ${message}`,
      ok: false,
      rss: null,
      youtube: [],
      youtubeSkipped: !apiKey,
    };
  }

  const youtubeResults: YoutubeSyncFeedResult[] = [];
  let ytAttempted = 0;
  let ytSucceeded = 0;
  let ytFailed = 0;
  let ytInserted = 0;
  let ytUpdated = 0;

  if (apiKey) {
    for (const seed of sourceFeeds) {
      if (seed.active === false || !seed.youtubeChannelId) continue;
      if (slugFilter && seed.showSlug !== slugFilter && seed.title !== slugFilter) continue;

      ytAttempted += 1;
      const youtubeMax = seed.stableCatalog ? 25 : maxYoutubeItems;
      try {
        const payload = await fetchYoutubeIngest(seed, apiKey, { maxItems: youtubeMax });
        const stats = await persistIngest(supabase, payload);
        ytSucceeded += 1;
        ytInserted += stats.episodesInserted;
        ytUpdated += stats.episodesUpdated;
        console.log(
          "sync all: YouTube OK",
          seed.title,
          "inserted",
          stats.episodesInserted,
          "updated",
          stats.episodesUpdated
        );
        youtubeResults.push({
          slug: payload.slug,
          title: seed.title,
          youtubeChannelId: seed.youtubeChannelId,
          ok: true,
          inserted: stats.episodesInserted,
          updated: stats.episodesUpdated,
          episodesTouched: stats.episodeCount,
        });
      } catch (e) {
        ytFailed += 1;
        const message = e instanceof Error ? e.message : String(e);
        console.error("sync all: YouTube FAIL", seed.title, message);
        youtubeResults.push({
          slug: seed.showSlug ?? slugifyTitle(seed.title),
          title: seed.title,
          youtubeChannelId: seed.youtubeChannelId,
          ok: false,
          error: message,
        });
      }
    }
  }

  const rssErrors: SyncErrorRow[] = rssSummary.feeds
    .filter((f) => !f.ok)
    .map((f) => ({
      feedTitle: f.title,
      feedUrl: f.rssUrl,
      error: f.error ?? "unknown error",
    }));

  const youtubeErrors: SyncErrorRow[] = youtubeResults
    .filter((y) => !y.ok)
    .map((y) => ({
      feedTitle: y.title,
      feedUrl: y.youtubeChannelId ? `youtube:${y.youtubeChannelId}` : "youtube",
      error: y.error ?? "unknown error",
    }));

  const errors = [...rssErrors, ...youtubeErrors];
  const feedsAttempted = rssSummary.totalFeedsAttempted + ytAttempted;
  const feedsSucceeded = rssSummary.feedsSucceeded + ytSucceeded;
  const feedsFailed = rssSummary.feedsFailed + ytFailed;
  const episodesInserted = rssSummary.episodesInserted + ytInserted;
  const episodesUpdated = rssSummary.episodesUpdated + ytUpdated;

  const body: SyncAllBody = {
    totalFeeds: totalRssConfigured,
    feedsAttempted,
    feedsSucceeded,
    feedsFailed,
    episodesInserted,
    episodesUpdated,
    errors,
    ok: rssSummary.ok && youtubeResults.every((y) => y.ok),
    rss: rssSummary,
    youtube: youtubeResults,
    youtubeSkipped: !apiKey,
  };

  console.log(
    "sync all: done feedsAttempted",
    feedsAttempted,
    "succeeded",
    feedsSucceeded,
    "failed",
    feedsFailed,
    "episodesInserted",
    episodesInserted,
    "episodesUpdated",
    episodesUpdated
  );

  return body;
}

async function maybeRunCyclePipeline(
  supabase: SupabaseClient,
  body: SyncAllBody,
  options: RunSyncAllOptions
): Promise<SyncAllBody> {
  if (options.runCyclePipeline === false) {
    return { ...body, cycle: null };
  }

  if (body.error) {
    return { ...body, cycle: null };
  }

  try {
    const cycle = await runPostSyncCyclePipeline(supabase);
    console.log(
      "sync all: cycle pipeline",
      "promoted",
      cycle.promoted,
      "blockedBySessions",
      cycle.promotionBlockedBySessions,
      "snapshot",
      cycle.snapshotEpisodeCount
    );
    return { ...body, cycle };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const missingMigration =
      /catalog_cycles|catalog_cycle_episodes|member_listening_sessions/i.test(message) &&
      /does not exist|relation|schema cache/i.test(message);
    if (missingMigration) {
      console.warn("sync all: cycle pipeline skipped — apply catalog_cycles migration", message);
      return { ...body, cycle: null };
    }
    console.error("sync all: cycle pipeline failed", message);
    return {
      ...body,
      ok: false,
      errors: [...body.errors, { feedTitle: "(catalog cycle)", feedUrl: "", error: message }],
      cycle: null,
    };
  }
}

/** Service-role client + full catalog sync. Returns 503-shaped body when DB is unavailable. */
export async function runSyncAllWithServiceClient(options: RunSyncAllOptions = {}): Promise<SyncAllBody> {
  const supabase = createServiceClient();
  if (!supabase) {
    console.error("sync all: service Supabase not configured");
    return unconfiguredBody(getActiveRssSeeds(sourceFeeds).length);
  }
  const body = await runSyncAll(supabase, options);
  return maybeRunCyclePipeline(supabase, body, options);
}
