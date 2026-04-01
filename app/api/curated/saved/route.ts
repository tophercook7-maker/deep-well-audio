import { NextResponse } from "next/server";
import { requireCuratedLibraryRoute, isSignedInRouteError } from "@/lib/premium-route";
import { isValidYoutubeVideoId, sanitizeCategorySlug, sanitizeSourceId } from "@/lib/curated/ids";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireCuratedLibraryRoute();
  if (isSignedInRouteError(gate)) return gate.error;

  const { data, error } = await gate.supabase
    .from("curated_saved_items")
    .select("id, youtube_video_id, source_id, category_slug, title_snapshot, created_at")
    .eq("user_id", gate.user.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const gate = await requireCuratedLibraryRoute();
  if (isSignedInRouteError(gate)) return gate.error;

  let body: { video_id?: string; source_id?: string; category?: string | null; title?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const videoId = typeof body.video_id === "string" ? body.video_id.trim() : "";
  if (!isValidYoutubeVideoId(videoId)) {
    return NextResponse.json({ error: "Invalid video_id" }, { status: 400 });
  }

  const row = {
    user_id: gate.user.id,
    youtube_video_id: videoId,
    source_id: sanitizeSourceId(body.source_id),
    category_slug: sanitizeCategorySlug(body.category),
    title_snapshot: typeof body.title === "string" ? body.title.trim().slice(0, 500) : null,
  };

  const { error } = await gate.supabase.from("curated_saved_items").insert(row);
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
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
    .from("curated_saved_items")
    .delete()
    .eq("user_id", gate.user.id)
    .eq("youtube_video_id", videoId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
