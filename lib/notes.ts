import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export type EpisodeNoteRow = {
  id: string;
  user_id: string;
  episode_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export async function getEpisodeNotes(userId: string, episodeId: string): Promise<EpisodeNoteRow[]> {
  if (!hasPublicSupabaseEnv() || !userId || !episodeId) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("episode_notes")
      .select("id, user_id, episode_id, body, created_at, updated_at")
      .eq("user_id", userId)
      .eq("episode_id", episodeId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("getEpisodeNotes:", error.message);
      return [];
    }
    return (data ?? []) as EpisodeNoteRow[];
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    console.error("getEpisodeNotes:", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function createEpisodeNote(
  supabase: SupabaseClient,
  userId: string,
  input: { episodeId: string; body: string }
): Promise<{ note: EpisodeNoteRow | null; error: string | null }> {
  const body = input.body.trim();
  if (!body) {
    return { note: null, error: "Note cannot be empty." };
  }
  const { data, error } = await supabase
    .from("episode_notes")
    .insert({
      user_id: userId,
      episode_id: input.episodeId,
      body: body.slice(0, 20_000),
    })
    .select("id, user_id, episode_id, body, created_at, updated_at")
    .single();

  if (error) {
    return { note: null, error: error.message };
  }
  return { note: data as EpisodeNoteRow, error: null };
}

export async function updateEpisodeNote(
  supabase: SupabaseClient,
  userId: string,
  noteId: string,
  body: string
): Promise<{ note: EpisodeNoteRow | null; error: string | null }> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { note: null, error: "Note cannot be empty." };
  }
  const { data, error } = await supabase
    .from("episode_notes")
    .update({ body: trimmed.slice(0, 20_000) })
    .eq("id", noteId)
    .eq("user_id", userId)
    .select("id, user_id, episode_id, body, created_at, updated_at")
    .single();

  if (error) {
    return { note: null, error: error.message };
  }
  return { note: data as EpisodeNoteRow, error: null };
}

export async function deleteEpisodeNote(
  supabase: SupabaseClient,
  userId: string,
  noteId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("episode_notes").delete().eq("id", noteId).eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
