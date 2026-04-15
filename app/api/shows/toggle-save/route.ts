import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/auth";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    console.error("[api:shows/toggle-save] Supabase unavailable");
    return NextResponse.json({ error: "Sign-in is not configured" }, { status: 503 });
  }

  let userRes;
  try {
    userRes = await supabase.auth.getUser();
  } catch (e) {
    console.error("[api:shows/toggle-save] getUser", e instanceof Error ? e.message : e);
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

  let body: { show_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const showId = body.show_id;
  if (!showId) {
    return NextResponse.json({ error: "show_id is required" }, { status: 400 });
  }

  try {
    const { data: existing } = await supabase
      .from("saved_shows")
      .select("id")
      .eq("user_id", user.id)
      .eq("show_id", showId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase.from("saved_shows").delete().eq("id", existing.id);
      if (error) {
        console.error("[api:shows/toggle-save] delete", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ saved: false });
    }

    const { error } = await supabase.from("saved_shows").insert({
      user_id: user.id,
      show_id: showId,
    });

    if (error) {
      console.error("[api:shows/toggle-save] insert", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ saved: true });
  } catch (e) {
    console.error("[api:shows/toggle-save]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
