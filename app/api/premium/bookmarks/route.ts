import { NextResponse } from "next/server";
import { requirePremiumSupabase, isPremiumRouteError } from "@/lib/premium-route";
import { createEpisodeBookmark, deleteEpisodeBookmark } from "@/lib/bookmarks";

export async function POST(request: Request) {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) return gate.error;

  let body: { episode_id?: string; seconds?: number; label?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const episodeId = typeof body.episode_id === "string" ? body.episode_id.trim() : "";
  if (!episodeId) {
    return NextResponse.json({ error: "episode_id is required" }, { status: 400 });
  }

  const sec = typeof body.seconds === "number" ? body.seconds : Number(body.seconds);
  if (!Number.isFinite(sec) || sec < 0) {
    return NextResponse.json({ error: "seconds must be a non-negative number" }, { status: 400 });
  }

  const { bookmark, error } = await createEpisodeBookmark(gate.supabase, gate.user.id, {
    episodeId,
    seconds: sec,
    label: body.label ?? null,
  });

  if (error || !bookmark) {
    return NextResponse.json({ error: error ?? "Could not create bookmark" }, { status: 500 });
  }

  return NextResponse.json({ bookmark });
}

export async function DELETE(request: Request) {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) return gate.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
  }

  const { error } = await deleteEpisodeBookmark(gate.supabase, gate.user.id, id);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
