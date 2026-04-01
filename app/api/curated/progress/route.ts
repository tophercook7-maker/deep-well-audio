import { NextResponse } from "next/server";
import { requireCuratedLibraryRoute, isSignedInRouteError } from "@/lib/premium-route";
import { isValidYoutubeVideoId, sanitizeSourceId } from "@/lib/curated/ids";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const gate = await requireCuratedLibraryRoute();
  if (isSignedInRouteError(gate)) return gate.error;

  let body: {
    video_id?: string;
    source_id?: string;
    opened?: boolean;
    progress_percent?: number;
    completed?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const videoId = typeof body.video_id === "string" ? body.video_id.trim() : "";
  if (!isValidYoutubeVideoId(videoId)) {
    return NextResponse.json({ error: "Invalid video_id" }, { status: 400 });
  }

  let progressPercent =
    typeof body.progress_percent === "number" && Number.isFinite(body.progress_percent)
      ? Math.round(body.progress_percent)
      : undefined;
  if (progressPercent !== undefined) {
    progressPercent = Math.max(0, Math.min(100, progressPercent));
  }

  const completed = body.completed === true;
  if (completed) {
    progressPercent = 100;
  }

  if (body.opened === true && progressPercent === undefined && !completed) {
    progressPercent = 0;
  }

  if (progressPercent === undefined && !completed) {
    return NextResponse.json({ error: "opened, progress_percent, or completed required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const row = {
    user_id: gate.user.id,
    youtube_video_id: videoId,
    source_id: sanitizeSourceId(body.source_id),
    progress_percent: progressPercent ?? 0,
    completed,
    last_watched_at: now,
  };

  const { error } = await gate.supabase.from("curated_video_progress").upsert(
    {
      ...row,
      updated_at: now,
    },
    { onConflict: "user_id,youtube_video_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
