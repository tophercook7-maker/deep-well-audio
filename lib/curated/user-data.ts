import type { SupabaseClient } from "@supabase/supabase-js";

export type CuratedSavedRow = {
  id: string;
  youtube_video_id: string;
  source_id: string;
  category_slug: string | null;
  title_snapshot: string | null;
  created_at: string;
};

export type CuratedNoteRow = {
  id: string;
  youtube_video_id: string;
  source_id: string;
  title_snapshot: string | null;
  note_content: string;
  updated_at: string;
};

export type CuratedProgressRow = {
  id: string;
  youtube_video_id: string;
  source_id: string;
  progress_percent: number;
  last_watched_at: string;
  completed: boolean;
  updated_at: string;
};

export async function listCuratedSaves(supabase: SupabaseClient, userId: string, limit = 48): Promise<CuratedSavedRow[]> {
  const { data, error } = await supabase
    .from("curated_saved_items")
    .select("id, youtube_video_id, source_id, category_slug, title_snapshot, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[curated] list saves", error.message);
    return [];
  }
  return (data ?? []) as CuratedSavedRow[];
}

export async function listCuratedProgressContinue(
  supabase: SupabaseClient,
  userId: string,
  limit = 12
): Promise<CuratedProgressRow[]> {
  const { data, error } = await supabase
    .from("curated_video_progress")
    .select("id, youtube_video_id, source_id, progress_percent, last_watched_at, completed, updated_at")
    .eq("user_id", userId)
    .eq("completed", false)
    .order("last_watched_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[curated] list progress", error.message);
    return [];
  }
  return (data ?? []) as CuratedProgressRow[];
}

/** Map video id -> saved row id if exists */
export async function getCuratedSavedIds(
  supabase: SupabaseClient,
  userId: string,
  videoIds: string[]
): Promise<Set<string>> {
  if (videoIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from("curated_saved_items")
    .select("youtube_video_id")
    .eq("user_id", userId)
    .in("youtube_video_id", videoIds);

  if (error) {
    console.error("[curated] saved ids", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r) => (r as { youtube_video_id: string }).youtube_video_id));
}
