"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BibleVerseShare } from "@/components/bible/bible-verse-share";
import { bibleChapterPath, bookLabelFromUrlBook } from "@/lib/bible/navigation-urls";
import { fetchVerseTextFromPassageApi } from "@/lib/bible/verse-share";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { isStudyTranslationId } from "@/lib/study/bible-api";
import { parseVerseRefKey, type VerseRefParts } from "@/lib/study/reference-keys";

type Row = {
  id: string;
  content_type: string;
  reference_key: string;
  note: string;
  updated_at: string;
};

function NoteVerseShareInner({ parsed }: { parsed: VerseRefParts }) {
  const [verseText, setVerseText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const translation = (isStudyTranslationId(parsed.translation) ? parsed.translation : "web") as StudyTranslationId;
  const bookSlug = parsed.bookSlug;
  const bookLabel = bookLabelFromUrlBook(bookSlug) ?? bookSlug.replace(/-/g, " ");

  const payload = useMemo(() => {
    if (!verseText?.trim()) return null;
    return {
      verseText,
      bookLabel,
      chapter: parsed.chapter,
      verse: parsed.verse,
      translation,
      urlBook: bookSlug,
    };
  }, [verseText, bookLabel, parsed.chapter, parsed.verse, translation, bookSlug]);

  const loadVerse = async () => {
    if (verseText || busy) return;
    setBusy(true);
    const t = await fetchVerseTextFromPassageApi(translation, bookSlug, parsed.chapter, parsed.verse);
    setBusy(false);
    if (t) setVerseText(t);
  };

  const chapterHref = (`${bibleChapterPath(translation, bookSlug, parsed.chapter)}#${parsed.verse}`) as Route;

  if (payload) {
    return (
      <div className="mt-3 rounded-xl border border-line/40 bg-soft/10 px-3 py-3">
        <BibleVerseShare {...payload} compact />
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void loadVerse()}
        className="text-xs font-medium text-amber-200/85 underline-offset-2 hover:text-amber-100 hover:underline disabled:opacity-50"
      >
        {busy ? "Loading…" : "Share this verse"}
      </button>
      <Link href={chapterHref} className="text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline">
        Open in reader
      </Link>
    </div>
  );
}

function NoteVerseShareBlock({ referenceKey }: { referenceKey: string }) {
  const parsed = parseVerseRefKey(referenceKey);
  if (!parsed) return null;
  return <NoteVerseShareInner parsed={parsed} />;
}

export function MeNotesClient() {
  const [items, setItems] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    const res = await fetch("/api/study-tools/notes?limit=100", { credentials: "include" });
    if (!res.ok) {
      setErr("Could not load notes.");
      setItems([]);
      return;
    }
    const j = (await res.json()) as { items: Row[] };
    setItems(j.items ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    const res = await fetch(`/api/study-tools/notes?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setItems((list) => (list ?? []).filter((x) => x.id !== id));
  };

  if (items === null) {
    return <p className="mt-8 text-sm text-slate-500">Loading…</p>;
  }
  if (err) {
    return <p className="mt-8 text-sm text-amber-200/80">{err}</p>;
  }
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-line/40 bg-soft/10 px-5 py-8 sm:px-6">
        <p className="text-sm leading-relaxed text-slate-300">Your notes will appear here.</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Save what stands out to you—verse by verse—in the Bible reader.</p>
        <Link
          href={"/bible" as Route}
          className="mt-5 inline-flex min-h-[44px] items-center rounded-full border border-line/60 bg-soft/20 px-4 py-2 text-sm font-medium text-amber-100/90 transition hover:border-accent/35"
        >
          Open Bible
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 space-y-4">
      {items.map((row) => (
        <li key={row.id} className="rounded-2xl border border-line/50 bg-soft/15 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{row.content_type}</p>
          <p className="mt-1 break-all font-mono text-xs text-amber-100/85">{row.reference_key}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-200/95">{row.note}</p>
          {row.content_type === "verse" ? <NoteVerseShareBlock referenceKey={row.reference_key} /> : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-600">{new Date(row.updated_at).toLocaleString()}</span>
            <button
              type="button"
              onClick={() => void remove(row.id)}
              className="text-xs font-medium text-rose-300/90 hover:underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
