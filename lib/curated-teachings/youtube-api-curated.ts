import type { CuratedYoutubeSource } from "@/data/curated-youtube-sources";
import { applySourceToFeedItem } from "@/lib/curated-teachings/enrich";
import type { CuratedYoutubeFeedItem } from "@/lib/curated-teachings/types";

const API = "https://www.googleapis.com/youtube/v3";

async function ytFetch<T>(apiKey: string, path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API}/${path}`);
  url.searchParams.set("key", apiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { next: { revalidate: 900 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube curated API ${path}: ${res.status} ${text.slice(0, 180)}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Latest uploads for a channel via the YouTube Data API (requires API key).
 */
export async function fetchYoutubeChannelViaApi(
  source: CuratedYoutubeSource,
  apiKey: string,
  maxItems: number
): Promise<CuratedYoutubeFeedItem[]> {
  const channelId = source.channelId?.trim();
  if (!channelId) {
    throw new Error(`Missing channelId for API ingest: ${source.id}`);
  }

  const cap = Math.min(Math.max(maxItems, 1), 50);

  const channelJson = await ytFetch<{
    items?: { id: string; contentDetails?: { relatedPlaylists?: { uploads?: string } } }[];
  }>(apiKey, "channels", {
    part: "contentDetails",
    id: channelId,
  });

  const uploadsId = channelJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) {
    throw new Error(`No uploads playlist for channel ${channelId}`);
  }

  const playlistJson = await ytFetch<{
    items?: {
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        channelTitle?: string;
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
        resourceId?: { videoId?: string };
      };
    }[];
  }>(apiKey, "playlistItems", {
    part: "snippet,contentDetails",
    playlistId: uploadsId,
    maxResults: String(cap),
  });

  const out: CuratedYoutubeFeedItem[] = [];
  for (const row of playlistJson.items ?? []) {
    const sn = row.snippet;
    const videoId = sn.resourceId?.videoId;
    if (!videoId) continue;
    const title = (sn.title && sn.title.trim()) || "Untitled";
    const publishedRaw = sn.publishedAt;
    const publishedAt =
      publishedRaw && !Number.isNaN(Date.parse(publishedRaw))
        ? new Date(publishedRaw).toISOString()
        : new Date().toISOString();
    const desc = sn.description?.trim() || null;
    const thumb = sn.thumbnails?.high?.url || sn.thumbnails?.medium?.url || null;
    const channelName = (sn.channelTitle && sn.channelTitle.trim()) || source.channelTitle || source.title;
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const base = {
      videoId,
      title,
      watchUrl,
      publishedAt,
      thumbnailUrl: thumb,
      description: desc,
      channelName,
      sourceId: source.id,
      sourceTitle: source.title,
      sourceType: source.sourceType,
      sourcePriority: source.priority,
    };
    out.push(applySourceToFeedItem(base, source));
  }

  return out;
}
