import { NextResponse } from "next/server";
import { sourceFeeds } from "@/data/source-feeds";
import { createServiceClient } from "@/lib/db";
import { getActiveRssSeeds, syncRssSeeds } from "@/lib/ingest/rss-sync";
import { fetchYoutubeIngest } from "@/lib/youtube";
import { persistIngest } from "@/lib/persist";
import { getOptionalYoutubeApiKey } from "@/lib/env";
import { requireSyncSecret } from "@/lib/sync-guard";

type SyncErrorRow = { feedTitle: string; feedUrl: string; error: string };

export async function POST(request: Request) {
  const denied = requireSyncSecret(request);
  if (denied) return denied;

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("sync all: service Supabase not configured");
    return NextResponse.json(
      {
        totalFeeds: getActiveRssSeeds(sourceFeeds).length,
        feedsAttempted: 0,
        feedsSucceeded: 0,
        feedsFailed: 0,
        episodesInserted: 0,
        episodesUpdated: 0,
        errors: [] as SyncErrorRow[],
        error: "Database not configured for ingestion",
        rss: null,
        youtube: [],
        youtubeSkipped: true,
      },
      { status: 503 }
    );
  }

  const apiKey = getOptionalYoutubeApiKey();

  let slugFilter: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    slugFilter = typeof body?.slug === "string" ? body.slug : undefined;
  } catch {
    slugFilter = undefined;
  }

  const totalRssConfigured = getActiveRssSeeds(sourceFeeds).length;
  console.log("sync all: start RSS configured count", totalRssConfigured, "slugFilter", slugFilter ?? "(none)");

  let rssSummary;
  try {
    rssSummary = await syncRssSeeds(supabase, sourceFeeds, {
      maxItems: 50,
      slugFilter,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("sync all: RSS batch failed", message);
    return NextResponse.json(
      {
        totalFeeds: totalRssConfigured,
        feedsAttempted: 0,
        feedsSucceeded: 0,
        feedsFailed: 1,
        episodesInserted: 0,
        episodesUpdated: 0,
        errors: [{ feedTitle: "(rss batch)", feedUrl: "", error: message }],
        error: `RSS sync failed: ${message}`,
        rss: null,
        youtube: [],
        youtubeSkipped: !apiKey,
      },
      { status: 500 }
    );
  }

  const youtubeResults: {
    slug: string;
    title: string;
    youtubeChannelId: string | null;
    ok: boolean;
    error?: string;
    inserted?: number;
    updated?: number;
    episodesTouched?: number;
  }[] = [];

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
      try {
        const payload = await fetchYoutubeIngest(seed, apiKey, { maxItems: 25 });
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

  const body = {
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

  return NextResponse.json(body);
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
