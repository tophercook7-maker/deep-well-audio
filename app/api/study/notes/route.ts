import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { STUDY_PREMIUM_UPGRADE } from "@/lib/study/copy";

export const dynamic = "force-dynamic";

const MAX_BODY = 12_000;
const FREE_NOTE_CAP = 2;

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? "20") || 20));
  const contentKey = url.searchParams.get("content_key")?.trim();

  let q = supabase
    .from("study_notes")
    .select("id, content_type, content_key, body, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (contentKey) {
    q = q.eq("content_key", contentKey);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const plan = await getUserPlan();

  let body: { content_type?: string; content_key?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const contentType = body.content_type === "teaching" || body.content_type === "verse" ? body.content_type : null;
  const contentKey = typeof body.content_key === "string" ? body.content_key.trim() : "";
  const text = typeof body.body === "string" ? body.body.replace(/\u0000/g, "").slice(0, MAX_BODY) : "";

  if (!contentType || !contentKey || contentKey.length > 512) {
    return NextResponse.json({ error: "content_type and content_key required" }, { status: 400 });
  }
  if (!text.trim()) {
    return NextResponse.json({ error: "body required" }, { status: 400 });
  }

  if (plan !== "premium") {
    const { count, error: cErr } = await supabase
      .from("study_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (cErr) {
      return NextResponse.json({ error: cErr.message }, { status: 500 });
    }
    if ((count ?? 0) >= FREE_NOTE_CAP) {
      return NextResponse.json(
        { error: STUDY_PREMIUM_UPGRADE, code: "premium_required", cap: FREE_NOTE_CAP },
        { status: 403 }
      );
    }
  }

  const row = {
    user_id: user.id,
    content_type: contentType,
    content_key: contentKey,
    body: text,
  };

  const { data, error } = await supabase.from("study_notes").insert(row).select("id, updated_at").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, note: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabase.from("study_notes").delete().eq("user_id", user.id).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
