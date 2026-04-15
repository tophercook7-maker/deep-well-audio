import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/auth";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    console.error("[api:favorites/toggle] Supabase unavailable");
    return NextResponse.json({ error: "Sign-in is not configured" }, { status: 503 });
  }

  let userRes;
  try {
    userRes = await supabase.auth.getUser();
  } catch (e) {
    console.error("[api:favorites/toggle] getUser", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Auth temporarily unavailable" }, { status: 503 });
  }

  const user = userRes.data.user;
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const plan = await getUserPlan();
  if (plan !== "premium") {
    return NextResponse.json({ error: "Premium required", code: "premium_required" }, { status: 403 });
  }

  let body: { episode_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const episodeId = body.episode_id;
  if (!episodeId) {
    return NextResponse.json({ error: "episode_id is required" }, { status: 400 });
  }

  try {
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("episode_id", episodeId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) {
        console.error("[api:favorites/toggle] delete", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ favorited: false });
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      episode_id: episodeId,
    });

    if (error) {
      console.error("[api:favorites/toggle] insert", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ favorited: true });
  } catch (e) {
    console.error("[api:favorites/toggle]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
