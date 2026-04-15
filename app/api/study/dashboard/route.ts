import { NextResponse } from "next/server";
import { requirePremiumSupabase, isPremiumRouteError } from "@/lib/premium-route";
import { STUDY_PREMIUM_UPGRADE } from "@/lib/study/copy";

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

  const uid = gate.user.id;

  const [notes, verses, history] = await Promise.all([
    gate.supabase
      .from("study_notes")
      .select("id, content_type, content_key, body, updated_at")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false })
      .limit(8),
    gate.supabase
      .from("study_saved_verses")
      .select("id, book_id, book_name, chapter, verse_from, verse_to, translation_id, passage_label, entry_kind, created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(8),
    gate.supabase
      .from("study_history")
      .select("passage_ref, translation_id, opened_at")
      .eq("user_id", uid)
      .order("opened_at", { ascending: false })
      .limit(8),
  ]);

  if (notes.error) {
    return NextResponse.json({ error: notes.error.message }, { status: 500 });
  }
  if (verses.error) {
    return NextResponse.json({ error: verses.error.message }, { status: 500 });
  }
  if (history.error) {
    return NextResponse.json({ error: history.error.message }, { status: 500 });
  }

  return NextResponse.json({
    recentNotes: notes.data ?? [],
    savedVerses: verses.data ?? [],
    recentHistory: history.data ?? [],
  });
}
