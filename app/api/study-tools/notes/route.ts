import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_NOTE = 12_000;

export async function GET(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? "50") || 50));
  const referencePrefix = url.searchParams.get("reference_prefix")?.trim();
  const referenceKey = url.searchParams.get("reference_key")?.trim();

  let q = supabase
    .from("study_user_notes")
    .select("id, content_type, reference_key, note, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (referencePrefix) {
    q = q.like("reference_key", `${referencePrefix}%`);
  } else if (referenceKey) {
    q = q.eq("reference_key", referenceKey);
  }

  const { data, error } = await q;

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

  let body: { content_type?: string; reference_key?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ct = body.content_type;
  const okCt = ct === "verse" || ct === "chapter" || ct === "topic" || ct === "lesson";
  const referenceKey = typeof body.reference_key === "string" ? body.reference_key.trim() : "";
  const note = typeof body.note === "string" ? body.note.replace(/\u0000/g, "").slice(0, MAX_NOTE) : "";

  if (!okCt || !referenceKey || referenceKey.length > 512) {
    return NextResponse.json({ error: "content_type and reference_key required" }, { status: 400 });
  }

  const row = {
    user_id: user.id,
    content_type: ct,
    reference_key: referenceKey,
    note,
  };

  const { data, error } = await supabase
    .from("study_user_notes")
    .upsert(row, { onConflict: "user_id,content_type,reference_key" })
    .select("id, updated_at")
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

  const { error } = await supabase.from("study_user_notes").delete().eq("user_id", user.id).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
