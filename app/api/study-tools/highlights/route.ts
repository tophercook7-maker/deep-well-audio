import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveTranslationAndBookIds } from "@/lib/study-tools/resolve-bible-ids";

export const dynamic = "force-dynamic";

const COLORS = ["yellow", "blue", "green", "pink", "purple"] as const;

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
  const filterTranslation = url.searchParams.get("translation_code")?.trim().toLowerCase();
  const filterBookSlug = url.searchParams.get("book_slug")?.trim().toLowerCase();

  let translationIdFilter: string | null = null;
  let bookIdFilter: string | null = null;
  if (filterTranslation && filterBookSlug) {
    const ids = await resolveTranslationAndBookIds(supabase, filterTranslation, filterBookSlug);
    if (ids) {
      translationIdFilter = ids.translationId;
      bookIdFilter = ids.bookId;
    }
  }

  let q = supabase
    .from("study_user_highlights")
    .select("id, translation_id, book_id, chapter_number, verse_number, color, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (translationIdFilter && bookIdFilter) {
    q = q.eq("translation_id", translationIdFilter).eq("book_id", bookIdFilter);
  }

  const { data: rows, error } = await q;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const list = rows ?? [];
  const tIds = [...new Set(list.map((r) => r.translation_id))];
  const bIds = [...new Set(list.map((r) => r.book_id))];

  const trRows =
    tIds.length > 0 ? ((await supabase.from("bible_translations").select("id, code").in("id", tIds)).data ?? []) : [];
  const bkRows = bIds.length > 0 ? ((await supabase.from("bible_books").select("id, slug").in("id", bIds)).data ?? []) : [];

  const tc = Object.fromEntries(trRows.map((x) => [x.id, x.code]));
  const bs = Object.fromEntries(bkRows.map((x) => [x.id, x.slug]));

  const items = list.map((r) => ({
    id: r.id,
    translationCode: tc[r.translation_id] ?? null,
    bookSlug: bs[r.book_id] ?? null,
    chapterNumber: r.chapter_number,
    verseNumber: r.verse_number,
    color: r.color,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let body: {
    translation_code?: string;
    book_slug?: string;
    chapter_number?: number;
    verse_number?: number;
    color?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const translationCode = typeof body.translation_code === "string" ? body.translation_code.trim() : "";
  const bookSlug = typeof body.book_slug === "string" ? body.book_slug.trim() : "";
  const chapterNumber = Number(body.chapter_number);
  const verseNumber = Number(body.verse_number);
  const color = typeof body.color === "string" ? body.color.trim().toLowerCase() : "";

  if (!translationCode || !bookSlug || !Number.isFinite(chapterNumber) || !Number.isFinite(verseNumber)) {
    return NextResponse.json({ error: "translation_code, book_slug, chapter_number, verse_number required" }, { status: 400 });
  }
  if (!COLORS.includes(color as (typeof COLORS)[number])) {
    return NextResponse.json({ error: "invalid color" }, { status: 400 });
  }

  const ids = await resolveTranslationAndBookIds(supabase, translationCode, bookSlug);
  if (!ids) return NextResponse.json({ error: "Unknown translation or book" }, { status: 400 });

  const row = {
    user_id: user.id,
    translation_id: ids.translationId,
    book_id: ids.bookId,
    chapter_number: chapterNumber,
    verse_number: verseNumber,
    color,
  };

  const { data, error } = await supabase
    .from("study_user_highlights")
    .upsert(row, { onConflict: "user_id,translation_id,book_id,chapter_number,verse_number" })
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

  const { error } = await supabase.from("study_user_highlights").delete().eq("user_id", user.id).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
