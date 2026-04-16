import type { SupabaseClient } from "@supabase/supabase-js";
import { parseScriptureTagForStudy, parseVerseContentKey } from "@/lib/study/refs";

export type StudyDebugSavedRow = {
  id: string;
  user_id: string;
  created_at: string;
  passage_label: string | null;
  book_id: string;
  /** Stored display name at save time (debug). */
  book_name: string;
  chapter: number;
  verse_from: number;
  verse_to: number;
  translation_id: string;
  entry_kind: string | null;
};

export type StudyDebugNoteRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  content_type: string;
  content_key: string;
  body: string;
};

export type StudyDebugHistoryRow = {
  id: string;
  user_id: string;
  opened_at: string;
  passage_ref: string;
  translation_id: string;
};

export type StudyDebugSnapshot = {
  savedPassages: StudyDebugSavedRow[];
  notes: StudyDebugNoteRow[];
  history: StudyDebugHistoryRow[];
  counts: {
    savedTotal: number;
    notesTotal: number;
    historyTotal: number;
    savedVerseKind: number;
    savedReaderKind: number;
    savedMissingKind: number;
  };
};

export function shortUserId(userId: string): string {
  if (!userId || userId.length < 10) return userId || "—";
  return `${userId.slice(0, 8)}…`;
}

export function formatStudyDebugTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function entryKindFriendly(kind: string | null | undefined): string {
  if (kind === "reader") return "Chapter reading";
  if (kind === "verse") return "Verse view";
  return "—";
}

export function noteKindFriendly(contentType: string): string {
  if (contentType === "verse") return "Verse note";
  if (contentType === "teaching") return "Teaching note";
  return contentType;
}

/** Human-readable target line for notes (verse label, teaching key summary, or raw). */
export function noteTargetDisplay(contentKey: string, contentType: string): string {
  if (contentType === "verse" || contentKey.startsWith("verse:")) {
    const hit = parseVerseContentKey(contentKey);
    if (hit) return hit.passage.label;
  }
  if (contentKey.startsWith("teaching:")) {
    const parts = contentKey.split(":");
    if (parts.length >= 3) {
      const id = parts[2] ?? "";
      const idFrag = id.length > 8 ? `…${id.slice(-6)}` : id;
      return `Teaching (${parts[1]} · ${idFrag})`;
    }
  }
  if (contentKey.length > 64) return `${contentKey.slice(0, 61)}…`;
  return contentKey;
}

export function historySurfaceHint(passageRef: string): string {
  const hit = parseScriptureTagForStudy(passageRef);
  if (!hit) return "—";
  return hit.kind === "verse" ? "Verse drawer" : "Chapter reader";
}

export async function fetchStudyDebugSnapshot(admin: SupabaseClient): Promise<{ ok: true; data: StudyDebugSnapshot } | { ok: false; error: string }> {
  const [
    savedRes,
    notesRes,
    histRes,
    cSaved,
    cNotes,
    cHist,
    cVerse,
    cReader,
    cMissingKind,
  ] = await Promise.all([
    admin
      .from("study_saved_verses")
      .select(
        "id, user_id, created_at, passage_label, book_id, book_name, chapter, verse_from, verse_to, translation_id, entry_kind"
      )
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("study_notes")
      .select("id, user_id, created_at, updated_at, content_type, content_key, body")
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("study_history")
      .select("id, user_id, opened_at, passage_ref, translation_id")
      .order("opened_at", { ascending: false })
      .limit(50),
    admin.from("study_saved_verses").select("*", { count: "exact", head: true }),
    admin.from("study_notes").select("*", { count: "exact", head: true }),
    admin.from("study_history").select("*", { count: "exact", head: true }),
    admin.from("study_saved_verses").select("*", { count: "exact", head: true }).eq("entry_kind", "verse"),
    admin.from("study_saved_verses").select("*", { count: "exact", head: true }).eq("entry_kind", "reader"),
    admin.from("study_saved_verses").select("*", { count: "exact", head: true }).is("entry_kind", null),
  ]);

  if (savedRes.error) return { ok: false, error: savedRes.error.message };
  if (notesRes.error) return { ok: false, error: notesRes.error.message };
  if (histRes.error) return { ok: false, error: histRes.error.message };
  const countErr =
    cSaved.error ?? cNotes.error ?? cHist.error ?? cVerse.error ?? cReader.error ?? cMissingKind.error;
  if (countErr) return { ok: false, error: countErr.message };

  const savedPassages = (savedRes.data ?? []) as StudyDebugSavedRow[];
  const notes = (notesRes.data ?? []) as StudyDebugNoteRow[];
  const history = (histRes.data ?? []) as StudyDebugHistoryRow[];

  return {
    ok: true,
    data: {
      savedPassages,
      notes,
      history,
      counts: {
        savedTotal: cSaved.count ?? 0,
        notesTotal: cNotes.count ?? 0,
        historyTotal: cHist.count ?? 0,
        savedVerseKind: cVerse.count ?? 0,
        savedReaderKind: cReader.count ?? 0,
        savedMissingKind: cMissingKind.count ?? 0,
      },
    },
  };
}
