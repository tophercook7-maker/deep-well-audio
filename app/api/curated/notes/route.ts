import { NextResponse } from "next/server";
import { requireCuratedLibraryRoute, isSignedInRouteError } from "@/lib/premium-route";
import { isValidYoutubeVideoId, sanitizeSourceId } from "@/lib/curated/ids";

export const dynamic = "force-dynamic";

const MAX_NOTE = 12_000;

export async function GET(request: Request) {
  const gate = await requireCuratedLibraryRoute();
  if (isSignedInRouteError(gate)) return gate.error;

  const url = new URL(request.url);
  const videoId = url.searchParams.get("video_id")?.trim() ?? "";
  if (!isValidYoutubeVideoId(videoId)) {
    return NextResponse.json({ error: "video_id required" }, { status: 400 });
  }

  const { data, error } = await gate.supabase
    .from("curated_video_notes")
    .select("id, note_content, updated_at")
    .eq("user_id", gate.user.id)
    .eq("youtube_video_id", videoId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note: data ?? null });
}

export async function POST(request: Request) {
  const gate = await requireCuratedLibraryRoute();
  if (isSignedInRouteError(gate)) return gate.error;

  let body: { video_id?: string; source_id?: string; title?: string | null; note_content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const videoId = typeof body.video_id === "string" ? body.video_id.trim() : "";
  if (!isValidYoutubeVideoId(videoId)) {
    return NextResponse.json({ error: "Invalid video_id" }, { status: 400 });
  }

  const content =
    typeof body.note_content === "string" ? body.note_content.replace(/\u0000/g, "").slice(0, MAX_NOTE) : "";
  if (!content.trim()) {
    return NextResponse.json({ error: "note_content required" }, { status: 400 });
  }

  const upsertRow = {
    user_id: gate.user.id,
    youtube_video_id: videoId,
    source_id: sanitizeSourceId(body.source_id),
    title_snapshot: typeof body.title === "string" ? body.title.trim().slice(0, 500) : null,
    note_content: content,
  };

  const { error } = await gate.supabase.from("curated_video_notes").upsert(upsertRow, {
    onConflict: "user_id,youtube_video_id",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const gate = await requireCuratedLibraryRoute();
  if (isSignedInRouteError(gate)) return gate.error;

  const url = new URL(request.url);
  const videoId = url.searchParams.get("video_id")?.trim() ?? "";
  if (!isValidYoutubeVideoId(videoId)) {
    return NextResponse.json({ error: "video_id required" }, { status: 400 });
  }

  const { error } = await gate.supabase
    .from("curated_video_notes")
    .delete()
    .eq("user_id", gate.user.id)
    .eq("youtube_video_id", videoId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
