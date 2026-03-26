import Parser from "rss-parser";
import type { SourceFeedSeed } from "@/data/source-feeds";
import { DEFAULT_SHOW_ARTWORK } from "@/lib/episode-playback";
import { coalesceEpisodeTitleForStorage, isWeakEpisodeTitle } from "@/lib/display";
import {
  fallbackEpisodeDescription,
  inferMeatyScore,
  parseDurationToSeconds,
  slugify,
  stableEpisodeExternalId,
} from "@/lib/normalizers";
import { mergeTopicTagsFromSeedAndText } from "@/lib/topic-infer";

const parser = new Parser({
  customFields: {
    feed: ["itunes:image", "image"],
    item: ["itunes:duration", "itunes:image", "media:content", "media:thumbnail"],
  },
});

function pickFeedImage(feed: unknown): string | null {
  const f = feed as Record<string, unknown>;
  const img = f.image as { url?: string } | undefined;
  if (img?.url) return img.url;
  const itunes = f["itunes:image"] as { $?: { href?: string }; href?: string } | string | undefined;
  if (typeof itunes === "string") return itunes;
  if (itunes && typeof itunes === "object" && "$" in itunes && itunes.$?.href) return itunes.$.href;
  if (itunes && typeof itunes === "object" && "href" in itunes && typeof itunes.href === "string")
    return itunes.href;
  return null;
}

function pickItemImage(item: Parser.Item & Record<string, unknown>): string | null {
  const thumb = item["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (thumb?.$?.url) return thumb.$.url;
  const it = item["itunes:image"] as { $?: { href?: string } } | undefined;
  if (it?.$?.href) return it.$.href;
  return null;
}

function pickDuration(item: Parser.Item & Record<string, unknown>): number | null {
  const raw =
    (item["itunes:duration"] as string | undefined) ||
    (item as { duration?: string }).duration ||
    (item["media:content"] as { $?: { duration?: string } } | undefined)?.$?.duration;
  return parseDurationToSeconds(raw ?? null);
}

export async function fetchRssXml(url: string): Promise<string> {
  const res = await fetch(url, {
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(25000),
    headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
  });
  if (!res.ok) {
    throw new Error(`RSS HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

/** Parse-only probe for debugging (no DB). */
export async function peekRssFeed(rssUrl: string): Promise<{
  feedTitle: string | null;
  itemCount: number;
  sampleTitles: string[];
  rawBytes: number;
  error?: string;
}> {
  const url = rssUrl.trim();
  if (!url) {
    return { feedTitle: null, itemCount: 0, sampleTitles: [], rawBytes: 0, error: "Empty RSS URL" };
  }
  try {
    const xml = await fetchRssXml(url);
    console.log("RSS PEEK FETCH OK:", url, "bytes", xml.length);
    let feed: Parser.Output<unknown>;
    try {
      feed = await parser.parseString(xml);
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      console.error("RSS PEEK PARSE FAIL:", url, msg);
      return { feedTitle: null, itemCount: 0, sampleTitles: [], rawBytes: xml.length, error: `Parse: ${msg}` };
    }
    const items = feed.items ?? [];
    const sampleTitles = items
      .slice(0, 3)
      .map((i) => (i.title && String(i.title).trim()) || "")
      .filter(Boolean);
    console.log("RSS PEEK PARSE OK:", feed.title ?? "(no title)", "items", items.length);
    return {
      feedTitle: (feed.title && feed.title.trim()) || null,
      itemCount: items.length,
      sampleTitles,
      rawBytes: xml.length,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("RSS PEEK FAIL:", url, msg);
    return { feedTitle: null, itemCount: 0, sampleTitles: [], rawBytes: 0, error: msg };
  }
}

export type NormalizedEpisodeInput = {
  external_id: string;
  title: string;
  slug: string;
  description: string | null;
  published_at: string | null;
  duration_seconds: number | null;
  audio_url: string | null;
  video_url: string | null;
  episode_url: string | null;
  source_type: string;
  scripture_tags: string[];
  topic_tags: string[];
  meaty_score: number;
  artwork_url: string | null;
};

export type RssIngestResult = {
  slug: string;
  title: string;
  host: string;
  summary: string;
  description: string | null;
  artwork_url: string | null;
  source_type: string;
  official_url: string | null;
  rss_url: string;
  youtube_channel_id: string | null;
  apple_url: string | null;
  spotify_url: string | null;
  category: string;
  tags: string[];
  meaty_score: number;
  featured: boolean;
  episodes: NormalizedEpisodeInput[];
};

export async function fetchRssIngest(
  seed: SourceFeedSeed,
  options: { maxItems?: number } = {}
): Promise<RssIngestResult> {
  const rssUrl = seed.rssUrl?.trim();
  if (!rssUrl) {
    throw new Error(`Missing rssUrl for ${seed.title}`);
  }

  const maxItems = options.maxItems ?? 50;
  console.log("SYNC START:", seed.title, rssUrl);

  const xml = await fetchRssXml(rssUrl);
  console.log("RSS FETCH OK:", seed.title, rssUrl, "bytes", xml.length);

  let feed: Parser.Output<unknown>;
  try {
    feed = await parser.parseString(xml);
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    console.error("RSS PARSE FAIL:", seed.title, rssUrl, msg);
    throw new Error(`RSS parse failed: ${msg}`);
  }

  const rawItemCount = feed.items?.length ?? 0;
  console.log("RSS PARSE OK:", seed.title, "feed title", feed.title ?? "(none)", "raw items", rawItemCount);

  const showSlug = seed.showSlug ?? slugify(seed.title);
  const title = (feed.title && feed.title.trim()) || seed.title;
  const description = feed.description?.trim() || null;
  const summary =
    seed.summary ||
    description?.slice(0, 280) ||
    `${title} — curated Christian audio on Deep Well Audio.`;
  let feedImage = pickFeedImage(feed);
  if (!feedImage) feedImage = DEFAULT_SHOW_ARTWORK;

  const rawItems = (feed.items ?? []).slice(0, maxItems);

  const episodes: NormalizedEpisodeInput[] = [];

  for (const raw of rawItems) {
    const item = raw as unknown as Parser.Item & Record<string, unknown>;
    const guidRaw =
      (typeof item.guid === "string" ? item.guid : (item.guid as { value?: string } | undefined)?.value) ||
      "";
    const link = (item.link && String(item.link).trim()) || null;
    const episodeTitle = item.title?.trim() || "";
    if (!episodeTitle && !link) continue;

    const published =
      item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : null);

    let titleSafe = episodeTitle;
    if (!titleSafe || isWeakEpisodeTitle(titleSafe)) {
      titleSafe = coalesceEpisodeTitleForStorage(episodeTitle, title, published, showSlug);
    }

    const extId = stableEpisodeExternalId({
      showSlug,
      feedUrl: rssUrl,
      guid: guidRaw || null,
      link,
      title: titleSafe,
      publishedAt: published,
    });

    const enclosureUrl =
      item.enclosure?.url ||
      (item["media:content"] as { $?: { url?: string } } | undefined)?.$?.url ||
      null;
    const audioUrl =
      enclosureUrl && !enclosureUrl.includes("youtube.com") && !enclosureUrl.includes("youtu.be")
        ? enclosureUrl
        : null;

    const durationSeconds = pickDuration(item);
    const slugBase = slugify(titleSafe, extId.slice(-12));
    const contentStr =
      typeof item.content === "string"
        ? item.content.trim()
        : item.content && typeof item.content === "object" && "encoded" in item.content
          ? String((item.content as { encoded?: string }).encoded ?? "").trim()
          : null;
    let desc = item.contentSnippet?.trim() || contentStr || null;
    if (!desc) desc = fallbackEpisodeDescription(titleSafe, seed.host);

    const meaty = inferMeatyScore({
      title: titleSafe,
      description: desc,
      durationSeconds,
      tags: seed.tags,
      category: seed.category,
      base: seed.meatyScore ?? 5,
    });

    const epArt = pickItemImage(item) || feedImage || DEFAULT_SHOW_ARTWORK;

    episodes.push({
      external_id: extId.slice(0, 500),
      title: titleSafe,
      slug: slugBase,
      description: desc,
      published_at: published,
      duration_seconds: durationSeconds,
      audio_url: audioUrl,
      video_url: null,
      episode_url: link,
      source_type: "rss",
      scripture_tags: [],
      topic_tags: mergeTopicTagsFromSeedAndText(seed.tags, titleSafe, desc),
      meaty_score: meaty,
      artwork_url: epArt,
    });
  }

  console.log(
    "RSS NORMALIZED:",
    seed.title,
    "episodes after filters/maxItems",
    episodes.length,
    "of",
    rawItems.length,
    "raw slice"
  );

  return {
    slug: showSlug,
    title,
    host: seed.host,
    summary,
    description,
    artwork_url: feedImage,
    source_type: seed.sourceType === "hybrid" ? "hybrid" : "rss",
    official_url: seed.officialUrl ?? null,
    rss_url: rssUrl,
    youtube_channel_id: seed.youtubeChannelId ?? null,
    apple_url: seed.appleUrl ?? null,
    spotify_url: seed.spotifyUrl ?? null,
    category: seed.category,
    tags: seed.tags ?? [],
    meaty_score: seed.meatyScore ?? 6,
    featured: seed.featured ?? false,
    episodes,
  };
}
