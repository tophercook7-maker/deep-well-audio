import { NextResponse } from "next/server";
import { requirePremiumSupabase, isPremiumRouteError } from "@/lib/premium-route";
import { STUDY_PREMIUM_UPGRADE } from "@/lib/study/copy";
import { isStudyTranslationId } from "@/lib/study/bible-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) {
    const status = gate.error.status;
    if (status === 403) {
      return NextResponse.json({ error: STUDY_PREMIUM_UPGRADE, code: "premium_required" }, { status: 403 });
    }
    return gate.error;
  }

  const { data, error } = await gate.supabase
    .from("study_saved_verses")
    .select("id, book_id, book_name, chapter, verse_from, verse_to, translation_id, passage_label, entry_kind, created_at")
    .eq("user_id", gate.user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) {
    const status = gate.error.status;
    if (status === 403) {
      return NextResponse.json({ error: STUDY_PREMIUM_UPGRADE, code: "premium_required" }, { status: 403 });
    }
    return gate.error;
  }

  let body: {
    book_id?: string;
    book_name?: string;
    chapter?: number;
    verse_from?: number;
    verse_to?: number;
    translation_id?: string;
    passage_label?: string | null;
    entry_kind?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bookId = typeof body.book_id === "string" ? body.book_id.trim().slice(0, 8) : "";
  const bookName = typeof body.book_name === "string" ? body.book_name.trim().slice(0, 64) : "";
  const chapter = Number(body.chapter);
  const verseFrom = Number(body.verse_from);
  const verseTo = body.verse_to != null ? Number(body.verse_to) : verseFrom;
  const translationId = typeof body.translation_id === "string" && isStudyTranslationId(body.translation_id) ? body.translation_id : "web";
  const passageLabel =
    typeof body.passage_label === "string" ? body.passage_label.trim().slice(0, 160) : null;
  const entryKind = body.entry_kind === "reader" ? "reader" : "verse";

  if (!bookId || !bookName || !Number.isFinite(chapter) || !Number.isFinite(verseFrom) || !Number.isFinite(verseTo)) {
    return NextResponse.json({ error: "Invalid passage" }, { status: 400 });
  }
  if (verseTo < verseFrom) {
    return NextResponse.json({ error: "Invalid verse range" }, { status: 400 });
  }

  const row = {
    user_id: gate.user.id,
    book_id: bookId,
    book_name: bookName,
    chapter,
    verse_from: verseFrom,
    verse_to: verseTo,
    translation_id: translationId,
    passage_label: passageLabel,
    entry_kind: entryKind,
  };

  const { data, error } = await gate.supabase.from("study_saved_verses").insert(row).select("id").single();
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id });
}

export async function DELETE(request: Request) {
  const gate = await requirePremiumSupabase();
  if (isPremiumRouteError(gate)) {
    const status = gate.error.status;
    if (status === 403) {
      return NextResponse.json({ error: STUDY_PREMIUM_UPGRADE, code: "premium_required" }, { status: 403 });
    }
    return gate.error;
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await gate.supabase.from("study_saved_verses").delete().eq("user_id", gate.user.id).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
