import { NextResponse } from "next/server";
import { requireCuratedLibraryRoute, isSignedInRouteError } from "@/lib/premium-route";
import { isValidYoutubeVideoId } from "@/lib/curated/ids";

export const dynamic = "force-dynamic";

const MAX_IDS = 80;

/**
 * One round-trip for card toolbars: saved flags, note snippet, progress per video id.
 */
export async function GET(request: Request) {
  const gate = await requireCuratedLibraryRoute();
  if (isSignedInRouteError(gate)) return gate.error;

  const url = new URL(request.url);
  const raw = url.searchParams.get("ids")?.trim() ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(isValidYoutubeVideoId)
    .slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json({ saved: [] as string[], notes: {}, progress: {} });
  }

  const [savedRes, notesRes, progRes] = await Promise.all([
    gate.supabase.from("curated_saved_items").select("youtube_video_id").eq("user_id", gate.user.id).in("youtube_video_id", ids),
    gate.supabase
      .from("curated_video_notes")
      .select("youtube_video_id, note_content")
      .eq("user_id", gate.user.id)
      .in("youtube_video_id", ids),
    gate.supabase
      .from("curated_video_progress")
      .select("youtube_video_id, progress_percent, completed, last_watched_at")
      .eq("user_id", gate.user.id)
      .in("youtube_video_id", ids),
  ]);

  const saved = (savedRes.data ?? []).map((r: { youtube_video_id: string }) => r.youtube_video_id);
  const notes: Record<string, string> = {};
  for (const row of notesRes.data ?? []) {
    const r = row as { youtube_video_id: string; note_content: string };
    notes[r.youtube_video_id] = r.note_content ?? "";
  }
  const progress: Record<string, { progress_percent: number; completed: boolean; last_watched_at: string }> = {};
  for (const row of progRes.data ?? []) {
    const r = row as {
      youtube_video_id: string;
      progress_percent: number;
      completed: boolean;
      last_watched_at: string;
    };
    progress[r.youtube_video_id] = {
      progress_percent: r.progress_percent,
      completed: r.completed,
      last_watched_at: r.last_watched_at,
    };
  }

  return NextResponse.json({ saved, notes, progress });
}
