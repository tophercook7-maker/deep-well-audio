import type { SupabaseClient } from "@supabase/supabase-js";
import type { SourceFeedSeed } from "@/data/source-feeds";
import { fetchRssIngest } from "@/lib/rss";
import { persistIngest } from "@/lib/persist";

export type FeedSyncResult = {
  slug: string;
  title: string;
  rssUrl: string;
  ok: boolean;
  error?: string;
  episodesTouched?: number;
  inserted?: number;
  updated?: number;
};

export type RssSyncSummary = {
  ok: boolean;
  /** Active RSS seeds in config (before slug filter). */
  totalFeedsConfigured: number;
  totalFeedsAttempted: number;
  feedsSucceeded: number;
  feedsFailed: number;
  episodesInserted: number;
  episodesUpdated: number;
  feeds: FeedSyncResult[];
};

export function getActiveRssSeeds(feeds: SourceFeedSeed[]): SourceFeedSeed[] {
  return feeds.filter((f) => f.active !== false && Boolean(f.rssUrl?.trim()));
}

export async function syncRssSeeds(
  supabase: SupabaseClient,
  seeds: SourceFeedSeed[],
  options: { maxItems?: number; slugFilter?: string } = {}
): Promise<RssSyncSummary> {
  const maxItems = options.maxItems ?? 50;
  let targets = getActiveRssSeeds(seeds);
  if (options.slugFilter) {
    const s = options.slugFilter;
    targets = targets.filter((t) => t.showSlug === s || t.title === s);
  }

  const configuredCount = getActiveRssSeeds(seeds).length;
  console.log("rss batch: configured active RSS feeds", configuredCount, "targets this run", targets.length);
  for (const t of targets) {
    console.log("rss batch will sync:", t.title, t.rssUrl?.trim() ?? "");
  }

  const feeds: FeedSyncResult[] = [];
  let feedsSucceeded = 0;
  let feedsFailed = 0;
  let episodesInserted = 0;
  let episodesUpdated = 0;

  for (const seed of targets) {
    const rssUrl = seed.rssUrl!.trim();
    try {
      const payload = await fetchRssIngest(seed, { maxItems });
      const stats = await persistIngest(supabase, payload);
      feedsSucceeded += 1;
      episodesInserted += stats.episodesInserted;
      episodesUpdated += stats.episodesUpdated;
      console.log(
        "SYNC SUCCESS:",
        seed.title,
        "parsed",
        payload.episodes.length,
        "episodes inserted",
        stats.episodesInserted,
        "updated",
        stats.episodesUpdated
      );
      feeds.push({
        slug: payload.slug,
        title: seed.title,
        rssUrl,
        ok: true,
        episodesTouched: stats.episodeCount,
        inserted: stats.episodesInserted,
        updated: stats.episodesUpdated,
      });
    } catch (e) {
      feedsFailed += 1;
      const message = e instanceof Error ? e.message : String(e);
      console.error("SYNC FAIL:", seed.title, rssUrl, message);
      feeds.push({
        slug: seed.showSlug ?? seed.title,
        title: seed.title,
        rssUrl,
        ok: false,
        error: message,
      });
    }
  }

  return {
    ok: feedsFailed === 0,
    totalFeedsConfigured: configuredCount,
    totalFeedsAttempted: feeds.length,
    feedsSucceeded,
    feedsFailed,
    episodesInserted,
    episodesUpdated,
    feeds,
  };
}
