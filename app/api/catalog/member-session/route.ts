import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import type { MemberSessionAction } from "@/lib/catalog-cycles";
import { touchMemberListeningSession } from "@/lib/catalog-cycles";
import { createServiceClient } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Pins signed-in listeners to a catalog cycle while playback is in progress.
 * Guests do not call this route — they always see the active cycle.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let body: { action?: MemberSessionAction; episode_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action;
  if (action !== "start" && action !== "heartbeat" && action !== "finish") {
    return NextResponse.json({ error: "action must be start, heartbeat, or finish" }, { status: 400 });
  }

  const episodeId = typeof body.episode_id === "string" ? body.episode_id.trim() : undefined;
  const result = await touchMemberListeningSession(supabase, user.id, action, episodeId || null);

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not update session" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cycle_id: result.cycleId });
}
