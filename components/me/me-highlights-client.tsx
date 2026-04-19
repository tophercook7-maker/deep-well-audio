"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useState } from "react";
import { bibleChapterPath } from "@/lib/bible/navigation-urls";
import type { StudyTranslationId } from "@/lib/study/bible-api";

type Row = {
  id: string;
  translationCode: string | null;
  bookSlug: string | null;
  chapterNumber: number;
  verseNumber: number;
  color: string;
};

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
    return <p className="mt-8 text-sm text-slate-500">No highlights yet. Mark verses in the Bible reader.</p>;
  }

  return (
    <ul className="mt-8 space-y-3">
      {items.map((h) => {
        const href =
          h.translationCode && h.bookSlug
            ? (bibleChapterPath(h.translationCode as StudyTranslationId, h.bookSlug, h.chapterNumber) as Route)
            : ("/bible" as Route);
        return (
          <li
            key={h.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line/50 bg-soft/15 px-4 py-3"
          >
            <div>
              <Link href={href} className="font-medium text-amber-100/90 hover:underline">
                {h.bookSlug?.replace(/-/g, " ")} {h.chapterNumber}:{h.verseNumber}
              </Link>
              <span className="ml-2 text-xs uppercase text-slate-500">{h.translationCode}</span>
              <span className="ml-2 text-xs text-slate-600">· {h.color}</span>
            </div>
            <button
              type="button"
              onClick={() => void remove(h.id)}
              className="text-xs font-medium text-rose-300/90 hover:underline"
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}
