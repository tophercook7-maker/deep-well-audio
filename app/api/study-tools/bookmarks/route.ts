import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? "100") || 100));

  const { data, error } = await supabase
    .from("study_user_bookmarks")
    .select("id, content_type, reference_key, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let body: { content_type?: string; reference_key?: string; title?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ct = body.content_type;
  const ok = ct === "verse" || ct === "chapter" || ct === "topic" || ct === "lesson";
  const referenceKey = typeof body.reference_key === "string" ? body.reference_key.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 512) : null;

  if (!ok || !referenceKey || referenceKey.length > 512) {
    return NextResponse.json({ error: "content_type and reference_key required" }, { status: 400 });
  }

  const row = {
    user_id: user.id,
    content_type: ct,
    reference_key: referenceKey,
    title: title || null,
  };

  const { data, error } = await supabase
    .from("study_user_bookmarks")
    .upsert(row, { onConflict: "user_id,content_type,reference_key" })
    .select("id, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, row: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase.from("study_user_bookmarks").delete().eq("user_id", user.id).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
