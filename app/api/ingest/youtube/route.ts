import { NextResponse } from "next/server";
import { sourceFeeds } from "@/data/source-feeds";
import { createServiceClient } from "@/lib/db";
import { fetchYoutubeIngest } from "@/lib/youtube";
import { persistIngest } from "@/lib/persist";
import { getOptionalYoutubeApiKey } from "@/lib/env";
import { requireSyncSecret } from "@/lib/sync-guard";

export async function POST(request: Request) {
  const denied = requireSyncSecret(request);
  if (denied) return denied;

  const apiKey = getOptionalYoutubeApiKey();
  if (!apiKey) {
    console.warn("[ingest/youtube] YOUTUBE_API_KEY missing");
    return NextResponse.json({ error: "YOUTUBE_API_KEY is not configured" }, { status: 500 });
  }

  let slugFilter: string | undefined;
  try {
    const body = await request.json().catch(() => ({}));
    slugFilter = typeof body?.slug === "string" ? body.slug : undefined;
  } catch {
    slugFilter = undefined;
  }

  const targets = sourceFeeds.filter(
    (s) =>
      s.active !== false &&
      s.youtubeChannelId &&
      (!slugFilter || s.showSlug === slugFilter || s.title === slugFilter)
  );

  if (!targets.length) {
    console.warn("[ingest/youtube] no YouTube sources matched");
    return NextResponse.json({ error: "No YouTube sources matched" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    console.error("[ingest/youtube] service Supabase not configured");
    return NextResponse.json({ error: "Database not configured for ingestion" }, { status: 503 });
  }

  const feeds: {
    slug: string;
    title: string;
    ok: boolean;
    error?: string;
    episodesTouched?: number;
    inserted?: number;
    updated?: number;
  }[] = [];

  for (const seed of targets) {
    if (!seed.youtubeChannelId) continue;
    try {
      const payload = await fetchYoutubeIngest(seed, apiKey, { maxItems: 25 });
      const stats = await persistIngest(supabase, payload);
      feeds.push({
        slug: payload.slug,
        title: seed.title,
        ok: true,
        episodesTouched: stats.episodeCount,
        inserted: stats.episodesInserted,
        updated: stats.episodesUpdated,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error(`[ingest/youtube] ${seed.title}`, message);
      feeds.push({
        slug: seed.showSlug ?? seed.title,
        title: seed.title,
        ok: false,
        error: message,
      });
    }
  }

  return NextResponse.json({
    ok: feeds.every((f) => f.ok),
    totalFeedsAttempted: feeds.length,
    feedsSucceeded: feeds.filter((f) => f.ok).length,
    feedsFailed: feeds.filter((f) => !f.ok).length,
    feeds,
  });
}
