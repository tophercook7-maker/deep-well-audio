import { NextResponse } from "next/server";
import { requirePremiumSupabase, isPremiumRouteError } from "@/lib/premium-route";
import { createEpisodeNote, deleteEpisodeNote, updateEpisodeNote } from "@/lib/notes";

export async function POST(request: Request) {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) return gate.error;

  let body: { episode_id?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const episodeId = typeof body.episode_id === "string" ? body.episode_id.trim() : "";
  if (!episodeId) {
    return NextResponse.json({ error: "episode_id is required" }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body : "";
  const { note, error } = await createEpisodeNote(gate.supabase, gate.user.id, {
    episodeId,
    body: text,
  });

  if (error || !note) {
    return NextResponse.json({ error: error ?? "Could not create note" }, { status: 400 });
  }

  return NextResponse.json({ note });
}

export async function PATCH(request: Request) {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) return gate.error;

  let body: { id?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body : "";
  const { note, error } = await updateEpisodeNote(gate.supabase, gate.user.id, id, text);

  if (error || !note) {
    return NextResponse.json({ error: error ?? "Could not update note" }, { status: 400 });
  }

  return NextResponse.json({ note });
}

export async function DELETE(request: Request) {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) return gate.error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
  }

  const { error } = await deleteEpisodeNote(gate.supabase, gate.user.id, id);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
