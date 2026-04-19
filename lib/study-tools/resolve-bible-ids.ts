import type { SupabaseClient } from "@supabase/supabase-js";

export async function resolveTranslationAndBookIds(
  supabase: SupabaseClient,
  translationCode: string,
  bookSlug: string
): Promise<{ translationId: string; bookId: string } | null> {
  const code = translationCode.trim().toLowerCase();
  const slug = bookSlug.trim().toLowerCase();
  const [tr, bk] = await Promise.all([
    supabase.from("bible_translations").select("id").eq("code", code).maybeSingle(),
    supabase.from("bible_books").select("id").eq("slug", slug).maybeSingle(),
  ]);
  if (tr.error || bk.error || !tr.data?.id || !bk.data?.id) return null;
  return { translationId: tr.data.id, bookId: bk.data.id };
}
