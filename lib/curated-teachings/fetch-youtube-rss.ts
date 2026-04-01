import Parser from "rss-parser";
import { fetchRssXml } from "@/lib/rss";
import type { CuratedYoutubeSource } from "@/data/curated-youtube-sources";
import { applySourceToFeedItem } from "@/lib/curated-teachings/enrich";
import type { CuratedYoutubeFeedItem } from "@/lib/curated-teachings/types";

const parser = new Parser({
  customFields: {
    item: ["media:group", "yt:videoId", "yt:channelId"],
  },
});

const YOUTUBE_CURATED_REVALIDATE_SECONDS = 600;

function asRecord(item: unknown): Record<string, unknown> {
  return item && typeof item === "object" ? (item as Record<string, unknown>) : {};
}

function stripTags(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractVideoId(entry: Record<string, unknown>): string | null {
  const fromYt = entry["yt:videoId"];
  if (typeof fromYt === "string" && /^[a-zA-Z0-9_-]{11}$/.test(fromYt)) return fromYt;
  const id = entry.id;
  if (typeof id === "string" && id.startsWith("yt:video:")) {
    const v = id.slice("yt:video:".length);
    return /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
  }
  return null;
}

function extractMediaThumbnail(entry: Record<string, unknown>): string | null {
  const group = entry["media:group"];
  if (!group || typeof group !== "object") return null;
  const g = group as Record<string, unknown>;
  const thumb = g["media:thumbnail"];
  if (Array.isArray(thumb)) {
    const last = thumb[thumb.length - 1] as Record<string, unknown> | undefined;
    const url = last?.["$"] as { url?: string } | undefined;
    if (url?.url && url.url.startsWith("http")) return url.url;
  }
  if (thumb && typeof thumb === "object") {
    const t = thumb as { $?: { url?: string }; url?: string };
    const u = t.$?.url ?? t.url;
    if (u && u.startsWith("http")) return u;
  }
  return null;
}

function extractMediaDescription(entry: Record<string, unknown>): string | null {
  const group = entry["media:group"];
  if (!group || typeof group !== "object") return null;
  const g = group as Record<string, unknown>;
  const desc = g["media:description"];
  if (typeof desc === "string" && desc.trim()) return stripTags(desc);
  return null;
}

function toWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Fetch and parse one YouTube channel Atom feed. Errors are thrown for HTTP/parse failures
 * (caller should catch per-source).
 */
export async function fetchYoutubeChannelRssItems(
  source: CuratedYoutubeSource,
  rssUrl: string,
  maxItems: number
): Promise<CuratedYoutubeFeedItem[]> {
  const xml = await fetchRssXml(rssUrl, { revalidate: YOUTUBE_CURATED_REVALIDATE_SECONDS });
  const feed = await parser.parseString(xml);
  const items = feed.items ?? [];
  const out: CuratedYoutubeFeedItem[] = [];
  const cap = Math.max(0, maxItems);

  for (const raw of items) {
    if (out.length >= cap) break;
    const item = raw as Parser.Item;
    const entry = asRecord(item);
    const videoId = extractVideoId(entry);
    if (!videoId) continue;

    const title = (item.title && String(item.title).trim()) || "Untitled";
    const publishedRaw = item.isoDate || item.pubDate;
    const publishedAt =
      publishedRaw && !Number.isNaN(Date.parse(publishedRaw))
        ? new Date(publishedRaw).toISOString()
        : new Date().toISOString();

    const watchUrl = toWatchUrl(videoId);

    const thumb = extractMediaThumbnail(entry);
    const descFromMedia = extractMediaDescription(entry);
    const summary = item.contentSnippet ? stripTags(String(item.contentSnippet)) : null;
    const description = descFromMedia || (summary && summary.length > 0 ? summary : null);

    const atomAuthor = (item as { author?: string }).author;
    const authorName = item.creator || (typeof atomAuthor === "string" ? atomAuthor : null);

    const channelName =
      (typeof authorName === "string" && authorName.trim()) || source.channelTitle || source.title;

    out.push(
      applySourceToFeedItem(
        {
          videoId,
          title,
          watchUrl,
          publishedAt,
          thumbnailUrl: thumb,
          description,
          channelName,
          sourceId: source.id,
          sourceTitle: source.title,
          sourceType: source.sourceType,
          sourcePriority: source.priority,
        },
        source
      )
    );
  }

  return out;
}
