import type { SourceFeedSeed } from "@/data/source-feeds";
import { inferMeatyScore, shortHash, slugify } from "@/lib/normalizers";
import type { NormalizedEpisodeInput } from "@/lib/rss";

const API = "https://www.googleapis.com/youtube/v3";

export type YouTubeIngestResult = {
  slug: string;
  title: string;
  host: string;
  summary: string;
  description: string | null;
  artwork_url: string | null;
  source_type: string;
  official_url: string | null;
  rss_url: string | null;
  youtube_channel_id: string;
  apple_url: string | null;
  spotify_url: string | null;
  category: string;
  tags: string[];
  meaty_score: number;
  featured: boolean;
  episodes: NormalizedEpisodeInput[];
};

type Snippet = {
  title: string;
  description: string;
  customUrl?: string;
  thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
};

function parseIso8601Duration(input: string): number | null {
  const m = input.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] || "0", 10);
  const min = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  return h * 3600 + min * 60 + s;
}

async function ytFetch<T>(path: string, apiKey: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API}/${path}`);
  url.searchParams.set("key", apiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API ${path} failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchYoutubeIngest(
  seed: SourceFeedSeed,
  apiKey: string,
  options: { maxItems?: number } = {}
): Promise<YouTubeIngestResult> {
  const channelId = seed.youtubeChannelId;
  if (!channelId) {
    throw new Error(`Missing youtubeChannelId for ${seed.title}`);
  }

  const maxItems = options.maxItems ?? 25;

  const channelJson = await ytFetch<{
    items?: { id: string; snippet: Snippet; contentDetails?: { relatedPlaylists?: { uploads?: string } } }[];
  }>("channels", apiKey, {
    part: "snippet,contentDetails",
    id: channelId,
  });

  const channel = channelJson.items?.[0];
  if (!channel) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) {
    throw new Error(`No uploads playlist for channel ${channelId}`);
  }

  const playlistJson = await ytFetch<{
    items?: {
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        resourceId?: { videoId?: string };
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
      };
    }[];
    nextPageToken?: string;
  }>("playlistItems", apiKey, {
    part: "snippet,contentDetails",
    playlistId: uploadsId,
    maxResults: String(Math.min(maxItems, 50)),
  });

  const playlistItems = playlistJson.items ?? [];
  const videoIds = playlistItems
    .map((i) => i.snippet.resourceId?.videoId)
    .filter((v): v is string => Boolean(v));

  const durations: Record<string, number | null> = {};
  if (videoIds.length) {
    const videoJson = await ytFetch<{ items?: { id: string; contentDetails?: { duration?: string } }[] }>(
      "videos",
      apiKey,
      {
        part: "contentDetails",
        id: videoIds.join(","),
      }
    );
    for (const v of videoJson.items ?? []) {
      const d = v.contentDetails?.duration;
      durations[v.id] = d ? parseIso8601Duration(d) : null;
    }
  }

  const slug = seed.showSlug ?? slugify(seed.title);
  const chSnippet = channel.snippet;
  const channelTitle = chSnippet.title?.trim() || seed.title;
  const description = chSnippet.description?.trim() || null;
  const summary = seed.summary || description?.slice(0, 280) || channelTitle;
  const artwork =
    chSnippet.thumbnails?.high?.url || chSnippet.thumbnails?.medium?.url || null;

  const episodes = playlistItems.flatMap((row): NormalizedEpisodeInput[] => {
    const sn = row.snippet;
    const videoId = sn.resourceId?.videoId;
    if (!videoId) return [];

    const episodeTitle = sn.title?.trim() || "Untitled video";
    const published = sn.publishedAt ? new Date(sn.publishedAt).toISOString() : null;
    const desc = sn.description?.trim() ?? null;
    const durationSeconds = durations[videoId] ?? null;
    const thumb = sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || null;

    const meaty = inferMeatyScore({
      title: episodeTitle,
      description: desc,
      durationSeconds,
      tags: seed.tags,
      category: seed.category,
      base: seed.meatyScore ?? 5,
    });

    return [
      {
        external_id: videoId,
        title: episodeTitle,
        slug: slugify(episodeTitle, shortHash(videoId)),
        description: desc,
        published_at: published,
        duration_seconds: durationSeconds,
        audio_url: null,
        video_url: `https://www.youtube.com/watch?v=${videoId}`,
        episode_url: `https://www.youtube.com/watch?v=${videoId}`,
        source_type: "youtube",
        scripture_tags: [],
        topic_tags: seed.tags ?? [],
        meaty_score: meaty,
        artwork_url: thumb,
      },
    ];
  });

  return {
    slug,
    title: channelTitle,
    host: seed.host,
    summary,
    description,
    artwork_url: artwork,
    source_type: seed.sourceType === "hybrid" ? "hybrid" : "youtube",
    official_url: seed.officialUrl ?? `https://www.youtube.com/channel/${channelId}`,
    rss_url: seed.rssUrl ?? null,
    youtube_channel_id: channelId,
    apple_url: seed.appleUrl ?? null,
    spotify_url: seed.spotifyUrl ?? null,
    category: seed.category,
    tags: seed.tags ?? [],
    meaty_score: seed.meatyScore ?? 6,
    featured: seed.featured ?? false,
    episodes,
  };
}
