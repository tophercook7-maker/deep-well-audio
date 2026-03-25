import { NextResponse } from "next/server";
import { sourceFeeds } from "@/data/source-feeds";
import { getActiveRssSeeds } from "@/lib/ingest/rss-sync";
import { peekRssFeed } from "@/lib/rss";
import { requireSyncSecret } from "@/lib/sync-guard";

/**
 * Fetch + parse one feed only (no DB). Protected like other sync routes.
 * GET ?slug=optional-show-slug — defaults to first active RSS seed.
 */
export async function GET(request: Request) {
  const denied = requireSyncSecret(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const explicitUrl = url.searchParams.get("url");

  const active = getActiveRssSeeds(sourceFeeds);
  if (!active.length) {
    return NextResponse.json({ error: "No active RSS feeds in source-feeds" }, { status: 400 });
  }

  let seed = active[0]!;
  if (slug) {
    const match = active.find((s) => s.showSlug === slug || s.title === slug);
    if (!match) {
      return NextResponse.json({ error: `No active RSS feed matches slug: ${slug}` }, { status: 404 });
    }
    seed = match;
  }

  const rssUrl = (explicitUrl?.trim() || seed.rssUrl?.trim()) ?? "";
  if (!rssUrl) {
    return NextResponse.json({ error: "No RSS URL for selected seed" }, { status: 400 });
  }

  console.log("DEBUG RSS route:", seed.title, rssUrl);

  const peek = await peekRssFeed(rssUrl);

  return NextResponse.json({
    seedTitle: seed.title,
    showSlug: seed.showSlug ?? null,
    rssUrl,
    feedTitle: peek.feedTitle,
    itemCount: peek.itemCount,
    sampleTitles: peek.sampleTitles,
    rawBytes: peek.rawBytes,
    error: peek.error ?? null,
  });
}
