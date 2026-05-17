import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EpisodeWithShow } from "@/lib/types";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

const BOOKMARK_SELECT = "id, user_id, episode_id, seconds, label, quote, note, scripture_ref, topic, created_at, updated_at";

export type EpisodeBookmarkRow = {
  id: string;
  user_id: string;
  episode_id: string;
  seconds: number;
  label: string | null;
  quote: string | null;
  note: string | null;
  scripture_ref: string | null;
  topic: string | null;
  created_at: string;
  updated_at: string | null;
};

export async function getEpisodeBookmarks(userId: string, episodeId: string): Promise<EpisodeBookmarkRow[]> {
  if (!hasPublicSupabaseEnv() || !userId || !episodeId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("episode_bookmarks")
      .select(BOOKMARK_SELECT)
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

export type SavedMomentWithEpisode = EpisodeBookmarkRow & {
  episode: EpisodeWithShow;
};

export async function getRecentSavedMoments(userId: string, limit = 6): Promise<SavedMomentWithEpisode[]> {
  if (!hasPublicSupabaseEnv() || !userId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("episode_bookmarks")
      .select(
        `${BOOKMARK_SELECT}, episode:episodes(*, show:shows(slug,title,host,artwork_url,category,official_url))`
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("getRecentSavedMoments:", error.message);
      return [];
    }

    return (data ?? [])
      .map((row) => {
        const episode = row.episode as unknown as EpisodeWithShow | null;
        if (!episode?.id) return null;
        return { ...(row as unknown as EpisodeBookmarkRow), episode };
      })
      .filter(Boolean) as SavedMomentWithEpisode[];
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("getRecentSavedMoments:", e instanceof Error ? e.message : e);
    return [];
  }
}

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

function cleanOptional(value: string | null | undefined, max = 500) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function createEpisodeBookmark(
  supabase: SupabaseClient,
  userId: string,
  input: {
    episodeId: string;
    seconds: number;
    label?: string | null;
    quote?: string | null;
    note?: string | null;
    scriptureRef?: string | null;
    topic?: string | null;
  }
): Promise<{ bookmark: EpisodeBookmarkRow | null; error: string | null }> {
  const seconds = Math.max(0, Math.floor(input.seconds));
  const { data, error } = await supabase
    .from("episode_bookmarks")
    .insert({
      user_id: userId,
      episode_id: input.episodeId,
      seconds,
      label: cleanOptional(input.label, 200),
      quote: cleanOptional(input.quote, 500),
      note: cleanOptional(input.note, 2000),
      scripture_ref: cleanOptional(input.scriptureRef, 120),
      topic: cleanOptional(input.topic, 80),
    })
    .select(BOOKMARK_SELECT)
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
