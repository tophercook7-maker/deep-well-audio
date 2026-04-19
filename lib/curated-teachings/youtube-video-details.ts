import type { CuratedYoutubeFeedItem } from "@/lib/curated-teachings/types";

const VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos";

/** Parse YouTube `contentDetails.duration` ISO 8601 (e.g. PT1H2M3S). */
export function parseYoutubeContentDuration(iso: string | undefined): number {
  if (!iso || typeof iso !== "string") return 0;
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  const s = Number(m[3] || 0);
  return h * 3600 + min * 60 + s;
}

export type YoutubeVideoDetail = {
  durationSec: number;
  thumbnailUrl: string | null;
};

/**
 * Batch `videos.list` (max 50 ids per request) for duration + best thumbnail.
 */
export async function batchFetchYoutubeVideoDetails(
  apiKey: string,
  videoIds: string[],
): Promise<Map<string, YoutubeVideoDetail>> {
  const out = new Map<string, YoutubeVideoDetail>();
  const uniq = [...new Set(videoIds.map((id) => id.trim()).filter(Boolean))];
  if (uniq.length === 0) return out;

  for (let i = 0; i < uniq.length; i += 50) {
    const chunk = uniq.slice(i, i + 50);
    const url = new URL(VIDEOS_API);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("part", "contentDetails,snippet");
    url.searchParams.set("id", chunk.join(","));
    const res = await fetch(url.toString(), { next: { revalidate: 900 } });
    if (!res.ok) {
      const text = await res.text();
      console.warn("youtube videos.list batch failed", res.status, text.slice(0, 200));
      continue;
    }
    const json = (await res.json()) as {
      items?: {
        id?: string;
        contentDetails?: { duration?: string };
        snippet?: {
          thumbnails?: {
            maxres?: { url?: string };
            high?: { url?: string };
            medium?: { url?: string };
          };
        };
      }[];
    };
    for (const row of json.items ?? []) {
      const id = row.id;
      if (!id) continue;
      const durationSec = parseYoutubeContentDuration(row.contentDetails?.duration);
      const th = row.snippet?.thumbnails;
      const thumbnailUrl =
        th?.maxres?.url || th?.high?.url || th?.medium?.url || null;
      out.set(id, { durationSec, thumbnailUrl });
    }
  }
  return out;
}

export async function enrichFeedItemsWithVideoDetails(
  apiKey: string,
  items: CuratedYoutubeFeedItem[],
): Promise<CuratedYoutubeFeedItem[]> {
  if (items.length === 0) return items;
  const map = await batchFetchYoutubeVideoDetails(
    apiKey,
    items.map((i) => i.videoId),
  );
  return items.map((it) => {
    const d = map.get(it.videoId);
    if (!d) return it;
    return {
      ...it,
      durationSec: d.durationSec > 0 ? d.durationSec : it.durationSec,
      thumbnailUrl: d.thumbnailUrl ?? it.thumbnailUrl,
    };
  });
}
