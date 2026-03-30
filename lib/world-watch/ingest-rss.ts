import type { SupabaseClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import { ensureUniqueWorldWatchSlug } from "@/lib/world-watch/ensure-slug-unique";
import { normalizeFeedSummary } from "@/lib/world-watch/normalize-summary";
import { getEnabledWorldWatchRssSources, type WorldWatchRssSource } from "@/lib/world-watch/sources";

const ITEMS_PER_FEED = 18;

type RssItem = {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
  summary?: string;
  enclosure?: { url?: string; type?: string };
};

function pickExternalImageUrl(item: RssItem): string | null {
  const enc = item.enclosure;
  if (enc?.url) {
    const type = enc.type?.toLowerCase() ?? "";
    if (type.startsWith("image/") || /\.(jpe?g|png|gif|webp)(\?|$)/i.test(enc.url)) {
      return enc.url.trim();
    }
  }
  return null;
}

function itemCanonicalUrl(item: RssItem): string | null {
  const link = typeof item.link === "string" ? item.link.trim() : "";
  if (!link) return null;
  try {
    const u = new URL(link);
    if (u.protocol === "https:" || u.protocol === "http:") return u.href;
  } catch {
    return null;
  }
  return null;
}

function itemGuid(item: RssItem, canonical: string | null): string | null {
  const g = typeof item.guid === "string" ? item.guid.trim() : "";
  if (g.length) return g;
  return canonical;
}

function itemPublishedAt(item: RssItem): string {
  const raw = item.isoDate || item.pubDate;
  if (raw) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}

function rawDescription(item: RssItem): string | undefined {
  if (typeof item.contentSnippet === "string" && item.contentSnippet.trim()) return item.contentSnippet;
  if (typeof item.summary === "string" && item.summary.trim()) return item.summary;
  if (typeof item.content === "string" && item.content.trim()) return item.content;
  return undefined;
}

async function fetchFeed(source: WorldWatchRssSource): Promise<{ items: RssItem[]; error?: string }> {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL(source.rss_url);
    const items = (feed.items ?? []) as RssItem[];
    return { items: items.slice(0, ITEMS_PER_FEED) };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { items: [], error: `${source.id}: ${msg}` };
  }
}

async function rowExists(
  admin: SupabaseClient,
  sourceFeed: string,
  sourceGuid: string,
  canonicalUrl: string | null
): Promise<boolean> {
  const { data: byGuid } = await admin
    .from("world_watch_items")
    .select("id")
    .eq("source_feed", sourceFeed)
    .eq("source_guid", sourceGuid)
    .maybeSingle();
  if (byGuid) return true;

  if (canonicalUrl) {
    const { data: byCan } = await admin.from("world_watch_items").select("id").eq("canonical_url", canonicalUrl).maybeSingle();
    if (byCan) return true;
  }
  return false;
}

export type WorldWatchIngestResult = {
  feedsAttempted: number;
  itemsScanned: number;
  inserted: number;
  skippedDuplicates: number;
  errors: string[];
};

export async function ingestWorldWatchRssFeeds(admin: SupabaseClient): Promise<WorldWatchIngestResult> {
  const result: WorldWatchIngestResult = {
    feedsAttempted: 0,
    itemsScanned: 0,
    inserted: 0,
    skippedDuplicates: 0,
    errors: [],
  };

  const sources = getEnabledWorldWatchRssSources();

  for (const source of sources) {
    result.feedsAttempted += 1;
    const { items, error } = await fetchFeed(source);
    if (error) {
      result.errors.push(error);
      continue;
    }

    for (const item of items) {
      result.itemsScanned += 1;
      const title = typeof item.title === "string" ? item.title.trim() : "";
      if (!title) continue;

      const canonical = itemCanonicalUrl(item);
      const guid = itemGuid(item, canonical);
      if (!guid) continue;

      const exists = await rowExists(admin, source.id, guid, canonical);
      if (exists) {
        result.skippedDuplicates += 1;
        continue;
      }

      const publishedAt = itemPublishedAt(item);
      const summary = normalizeFeedSummary(rawDescription(item), title);
      const externalImage = pickExternalImageUrl(item);
      const autoPublish = Boolean(source.safe_for_auto_publish);
      const slug = await ensureUniqueWorldWatchSlug(admin, title, null);

      const { error: insErr } = await admin.from("world_watch_items").insert({
        title,
        slug,
        source_name: source.name,
        source_url: canonical,
        source_type: "rss",
        source_feed: source.id,
        source_guid: guid,
        canonical_url: canonical,
        external_image_url: externalImage,
        image_url: null,
        summary,
        reflection: null,
        category: source.category_hint,
        is_published: autoPublish,
        published_at: publishedAt,
        pinned: false,
        pinned_rank: null,
        ingestion_status: autoPublish ? "ready" : "review",
      } as never);

      if (insErr) {
        if (insErr.code === "23505") {
          result.skippedDuplicates += 1;
        } else {
          result.errors.push(`${source.id} insert: ${insErr.message}`);
        }
        continue;
      }

      result.inserted += 1;
    }
  }

  return result;
}
