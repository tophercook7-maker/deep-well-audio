"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  content_type: string;
  reference_key: string;
  title: string | null;
  created_at: string;
};

export function MeBookmarksClient() {
  const [items, setItems] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/study-tools/bookmarks?limit=200", { credentials: "include" });
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
    const res = await fetch(`/api/study-tools/bookmarks?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setItems((list) => (list ?? []).filter((x) => x.id !== id));
  };

  if (items === null) return <p className="mt-8 text-sm text-slate-500">Loading…</p>;
  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-line/40 bg-soft/10 px-5 py-8 sm:px-6">
        <p className="text-sm leading-relaxed text-slate-300">Bookmarks you save from Scripture and studies will show up here.</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">Save a verse, chapter, or lesson when you want an easy way back.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={"/bible" as Route}
            className="inline-flex min-h-[44px] items-center rounded-full border border-line/60 bg-soft/20 px-4 py-2 text-sm font-medium text-amber-100/90 transition hover:border-accent/35"
          >
            Open Bible
          </Link>
          <Link
            href={"/studies" as Route}
            className="inline-flex min-h-[44px] items-center rounded-full border border-line/50 bg-soft/15 px-4 py-2 text-sm font-medium text-slate-300/95 transition hover:border-accent/30"
          >
            Studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {items.map((b) => (
        <li key={b.id} className="rounded-2xl border border-line/50 bg-soft/15 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{b.content_type}</p>
          <p className="mt-1 font-medium text-slate-100">{b.title || "Bookmark"}</p>
          <p className="mt-1 break-all font-mono text-xs text-amber-100/80">{b.reference_key}</p>
          <button
            type="button"
            onClick={() => void remove(b.id)}
            className="mt-2 text-xs font-medium text-rose-300/90 hover:underline"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
