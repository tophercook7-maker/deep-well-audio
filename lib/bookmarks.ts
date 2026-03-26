import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EpisodeWithShow } from "@/lib/types";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export type EpisodeBookmarkRow = {
  id: string;
  user_id: string;
  episode_id: string;
  seconds: number;
  label: string | null;
  created_at: string;
};

export async function getEpisodeBookmarks(userId: string, episodeId: string): Promise<EpisodeBookmarkRow[]> {
  if (!hasPublicSupabaseEnv() || !userId || !episodeId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("episode_bookmarks")
      .select("id, user_id, episode_id, seconds, label, created_at")
      .eq("user_id", userId)
      .eq("episode_id", episodeId)
      .order("seconds", { ascending: true });

    if (error) {
      console.error("getEpisodeBookmarks:", error.message);
      return [];
    }
    return (data ?? []) as EpisodeBookmarkRow[];
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("getEpisodeBookmarks:", e instanceof Error ? e.message : e);
    return [];
  }
}

export type RecentBookmarkEpisode = {
  episode: EpisodeWithShow;
  lastBookmarkAt: string;
  bookmarkCount: number;
};

export async function getRecentBookmarkEpisodes(userId: string, limit = 8): Promise<RecentBookmarkEpisode[]> {
  if (!hasPublicSupabaseEnv() || !userId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("episode_bookmarks")
      .select(
        "created_at, episode:episodes(*, show:shows(slug,title,host,artwork_url,category,official_url))"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      console.error("getRecentBookmarkEpisodes:", error.message);
      return [];
    }

    const byEpisode = new Map<
      string,
      { episode: EpisodeWithShow; lastBookmarkAt: string; bookmarkCount: number }
    >();

    for (const row of data ?? []) {
      const ep = row.episode as unknown as EpisodeWithShow | null;
      if (!ep?.id) continue;
      const existing = byEpisode.get(ep.id);
      const created = row.created_at as string;
      if (!existing) {
        byEpisode.set(ep.id, { episode: ep, lastBookmarkAt: created, bookmarkCount: 1 });
        continue;
      }
      existing.bookmarkCount += 1;
      if (new Date(created) > new Date(existing.lastBookmarkAt)) {
        existing.lastBookmarkAt = created;
      }
    }

    const sorted = [...byEpisode.values()].sort(
      (a, b) => new Date(b.lastBookmarkAt).getTime() - new Date(a.lastBookmarkAt).getTime()
    );

    return sorted.slice(0, limit);
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("getRecentBookmarkEpisodes:", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function createEpisodeBookmark(
  supabase: SupabaseClient,
  userId: string,
  input: { episodeId: string; seconds: number; label?: string | null }
): Promise<{ bookmark: EpisodeBookmarkRow | null; error: string | null }> {
  const seconds = Math.max(0, Math.floor(input.seconds));
  const { data, error } = await supabase
    .from("episode_bookmarks")
    .insert({
      user_id: userId,
      episode_id: input.episodeId,
      seconds,
      label: input.label?.trim() ? input.label.trim().slice(0, 200) : null,
    })
    .select("id, user_id, episode_id, seconds, label, created_at")
    .single();

  if (error) {
    return { bookmark: null, error: error.message };
  }
  return { bookmark: data as EpisodeBookmarkRow, error: null };
}

export async function deleteEpisodeBookmark(
  supabase: SupabaseClient,
  userId: string,
  bookmarkId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("episode_bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
