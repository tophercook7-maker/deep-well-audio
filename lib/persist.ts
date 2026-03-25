import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedEpisodeInput, RssIngestResult } from "@/lib/rss";
import type { YouTubeIngestResult } from "@/lib/youtube";
import { shortHash } from "@/lib/normalizers";

export type IngestPayload = RssIngestResult | YouTubeIngestResult;

function mergeSourceType(a: string | null | undefined, b: string): string {
  const cur = (a ?? "").toLowerCase();
  const incoming = b.toLowerCase();
  if (!cur) return incoming || "rss";
  if (cur === incoming) return incoming;
  if (cur === "hybrid" || incoming === "hybrid") return "hybrid";
  if (
    (cur === "rss" && incoming === "youtube") ||
    (cur === "youtube" && incoming === "rss")
  ) {
    return "hybrid";
  }
  return incoming;
}

export type PersistStats = {
  showId: string;
  episodeCount: number;
  episodesInserted: number;
  episodesUpdated: number;
};

export async function persistIngest(supabase: SupabaseClient, payload: IngestPayload): Promise<PersistStats> {
  const { data: existing, error: readErr } = await supabase
    .from("shows")
    .select("*")
    .eq("slug", payload.slug)
    .maybeSingle();

  if (readErr) {
    const msg = readErr.message || String(readErr);
    console.error("PERSIST SHOW READ FAIL:", payload.slug, msg);
    throw new Error(`Show read failed: ${msg}`);
  }

  const source_type = mergeSourceType(existing?.source_type, payload.source_type);

  const row = {
    slug: payload.slug,
    title: payload.title,
    host: payload.host,
    summary: payload.summary,
    description: payload.description,
    artwork_url: payload.artwork_url ?? existing?.artwork_url ?? null,
    source_type,
    official_url: payload.official_url ?? existing?.official_url ?? null,
    rss_url: payload.rss_url ?? existing?.rss_url ?? null,
    youtube_channel_id: payload.youtube_channel_id ?? existing?.youtube_channel_id ?? null,
    apple_url: payload.apple_url ?? existing?.apple_url ?? null,
    spotify_url: payload.spotify_url ?? existing?.spotify_url ?? null,
    category: payload.category,
    tags: payload.tags?.length ? payload.tags : existing?.tags ?? [],
    meaty_score: Math.max(payload.meaty_score, existing?.meaty_score ?? 0),
    featured: Boolean(payload.featured || existing?.featured),
    is_active: true,
  };

  const { data: show, error: upsertErr } = await supabase
    .from("shows")
    .upsert(row, { onConflict: "slug" })
    .select("id")
    .single();

  if (upsertErr) {
    const msg = upsertErr.message || String(upsertErr);
    console.error("PERSIST SHOW UPSERT FAIL:", payload.slug, msg);
    throw new Error(`Show upsert failed: ${msg}`);
  }
  const showId = show.id as string;
  console.log("PERSIST SHOW OK:", payload.slug, showId);

  let episodesInserted = 0;
  let episodesUpdated = 0;

  for (const ep of payload.episodes) {
    try {
      const outcome = await upsertEpisode(supabase, showId, ep);
      if (outcome === "insert") episodesInserted += 1;
      else if (outcome === "update") episodesUpdated += 1;
    } catch (epErr) {
      const msg = epErr instanceof Error ? epErr.message : String(epErr);
      console.error("PERSIST EPISODE FAIL:", payload.slug, ep.external_id, ep.title, msg);
      throw new Error(`Episode persist failed (${ep.title}): ${msg}`);
    }
  }

  console.log("PERSIST EPISODES DONE:", payload.slug, "inserted", episodesInserted, "updated", episodesUpdated);

  return {
    showId,
    episodeCount: payload.episodes.length,
    episodesInserted,
    episodesUpdated,
  };
}

async function upsertEpisode(
  supabase: SupabaseClient,
  showId: string,
  ep: NormalizedEpisodeInput
): Promise<"insert" | "update"> {
  const { data: found } = await supabase
    .from("episodes")
    .select("id")
    .eq("show_id", showId)
    .eq("external_id", ep.external_id)
    .maybeSingle();

  let slug = ep.slug;
  if (!found?.id) {
    const { data: slugRow } = await supabase
      .from("episodes")
      .select("id")
      .eq("show_id", showId)
      .eq("slug", slug)
      .maybeSingle();
    if (slugRow) {
      slug = `${ep.slug}-${shortHash(ep.external_id)}`.slice(0, 120);
    }
  }

  const payload = {
    show_id: showId,
    external_id: ep.external_id,
    title: ep.title,
    slug,
    description: ep.description,
    published_at: ep.published_at,
    duration_seconds: ep.duration_seconds,
    audio_url: ep.audio_url,
    video_url: ep.video_url,
    episode_url: ep.episode_url,
    source_type: ep.source_type,
    scripture_tags: ep.scripture_tags,
    topic_tags: ep.topic_tags,
    meaty_score: ep.meaty_score,
    artwork_url: ep.artwork_url,
  };

  if (found?.id) {
    const { error } = await supabase.from("episodes").update(payload).eq("id", found.id);
    if (error) {
      console.error("PERSIST EPISODE UPDATE FAIL:", showId, found.id, error.message);
      throw error;
    }
    return "update";
  }

  const { error } = await supabase.from("episodes").insert(payload);
  if (error) {
    console.error("PERSIST EPISODE INSERT FAIL:", showId, ep.slug, error.message);
    throw error;
  }
  return "insert";
}
