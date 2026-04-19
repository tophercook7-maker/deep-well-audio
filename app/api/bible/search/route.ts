import { NextResponse } from "next/server";
import { bibleReferenceJumpFromQuery } from "@/lib/bible/reference-jump";
import { createClient } from "@/lib/supabase/server";
import { isStudyTranslationId } from "@/lib/study/bible-api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const translationRaw = url.searchParams.get("translation") ?? "web";
  const translation = isStudyTranslationId(translationRaw) ? translationRaw : "web";

  const referenceJump = q.length > 0 ? bibleReferenceJumpFromQuery(q, translation) : null;

  if (q.length < 2) {
    return NextResponse.json({ verses: [], referenceJump, ftsAvailable: false });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ verses: [], referenceJump, ftsAvailable: false });
  }

  const { data: tr, error: trErr } = await supabase.from("bible_translations").select("id").eq("code", translation).maybeSingle();
  if (trErr || !tr?.id) {
    return NextResponse.json({ verses: [], referenceJump, ftsAvailable: false });
  }

  const { data: rows, error } = await supabase
    .from("bible_verses")
    .select("reference, text, chapter_number, verse_number, book_id")
    .eq("translation_id", tr.id)
    .textSearch("search_vector", q, { type: "websearch", config: "english" })
    .limit(40);

  if (error) {
    return NextResponse.json(
      { verses: [], referenceJump, ftsAvailable: true, ftsError: error.message },
      { status: 200 }
    );
  }

  const list = rows ?? [];
  const bIds = [...new Set(list.map((r) => r.book_id))];
  const { data: books } =
    bIds.length > 0
      ? await supabase.from("bible_books").select("id, slug").in("id", bIds)
      : { data: [] as { id: string; slug: string }[] };
  const slugById = Object.fromEntries((books ?? []).map((b) => [b.id, b.slug]));

  const verses = list.map((row) => ({
    reference: row.reference,
    text: row.text,
    chapter_number: row.chapter_number,
    verse_number: row.verse_number,
    book_slug: slugById[row.book_id] ?? null,
    translation_code: translation,
  }));

  return NextResponse.json({
    verses,
    referenceJump,
    ftsAvailable: true,
  });
}
