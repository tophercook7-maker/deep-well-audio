"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BibleVerseShare } from "@/components/bible/bible-verse-share";
import { bibleChapterPath, bookLabelFromUrlBook } from "@/lib/bible/navigation-urls";
import { fetchVerseTextFromPassageApi } from "@/lib/bible/verse-share";
import type { StudyTranslationId } from "@/lib/study/bible-api";
import { isStudyTranslationId } from "@/lib/study/bible-api";

type Row = {
  id: string;
  translationCode: string | null;
  bookSlug: string | null;
  chapterNumber: number;
  verseNumber: number;
  color: string;
};

function HighlightShareBlock({ h }: { h: Row }) {
  const [verseText, setVerseText] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const translation = (h.translationCode && isStudyTranslationId(h.translationCode) ? h.translationCode : "web") as StudyTranslationId;
  const bookSlug = h.bookSlug ?? "";
  const bookLabel = bookLabelFromUrlBook(bookSlug) ?? bookSlug.replace(/-/g, " ");

  const payload = useMemo(() => {
    if (!verseText?.trim()) return null;
    return {
      verseText,
      bookLabel,
      chapter: h.chapterNumber,
      verse: h.verseNumber,
      translation,
      urlBook: bookSlug,
    };
  }, [verseText, bookLabel, h.chapterNumber, h.verseNumber, translation, bookSlug]);

  const loadVerse = async () => {
    if (verseText || busy || !bookSlug) return;
    setBusy(true);
    const t = await fetchVerseTextFromPassageApi(translation, bookSlug, h.chapterNumber, h.verseNumber);
    setBusy(false);
    if (t) setVerseText(t);
  };

  if (payload) {
    return (
      <div className="mt-3 rounded-xl border border-line/40 bg-soft/10 px-3 py-3">
        <BibleVerseShare {...payload} compact />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={busy || !bookSlug}
      onClick={() => void loadVerse()}
      className="mt-2 text-xs font-medium text-amber-200/85 underline-offset-2 hover:text-amber-100 hover:underline disabled:opacity-50"
    >
      {busy ? "Loading…" : "Share this verse"}
    </button>
  );
}

export function MeHighlightsClient() {
  const [items, setItems] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/study-tools/highlights?limit=200", { credentials: "include" });
    if (!res.ok) {
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
    const res = await fetch(`/api/study-tools/highlights?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setItems((list) => (list ?? []).filter((x) => x.id !== id));
  };

  if (items === null) return <p className="mt-8 text-sm text-slate-500">Loading…</p>;
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-line/40 bg-soft/10 px-5 py-8 sm:px-6">
        <p className="text-sm leading-relaxed text-slate-300">Highlights you mark in the Bible reader will gather here.</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Choose a verse and select a color—nothing is rushed.</p>
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
    <ul className="mt-8 space-y-3">
      {items.map((h) => {
        const href =
          h.translationCode && h.bookSlug
            ? (`${bibleChapterPath(h.translationCode as StudyTranslationId, h.bookSlug, h.chapterNumber)}#${h.verseNumber}` as Route)
            : ("/bible" as Route);
        return (
          <li key={h.id} className="rounded-2xl border border-line/50 bg-soft/15 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={href} className="font-medium text-amber-100/90 hover:underline">
                  {h.bookSlug?.replace(/-/g, " ")} {h.chapterNumber}:{h.verseNumber}
                </Link>
                <span className="ml-2 text-xs uppercase text-slate-500">{h.translationCode}</span>
                <span className="ml-2 text-xs text-slate-600">· {h.color}</span>
              </div>
              <button
                type="button"
                onClick={() => void remove(h.id)}
                className="shrink-0 text-xs font-medium text-rose-300/90 hover:underline"
              >
                Remove
              </button>
            </div>
            <HighlightShareBlock h={h} />
          </li>
        );
      })}
    </ul>
  );
}
