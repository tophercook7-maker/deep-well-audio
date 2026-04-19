"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  content_type: string;
  reference_key: string;
  note: string;
  updated_at: string;
};

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
    return <p className="mt-8 text-sm text-slate-500">No notes yet. Add some from the Bible reader.</p>;
  }

  return (
    <ul className="mt-8 space-y-4">
      {items.map((row) => (
        <li key={row.id} className="rounded-2xl border border-line/50 bg-soft/15 px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{row.content_type}</p>
          <p className="mt-1 break-all font-mono text-xs text-amber-100/85">{row.reference_key}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-200/95">{row.note}</p>
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
