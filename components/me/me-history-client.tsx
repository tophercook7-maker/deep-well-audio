"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  content_type: string;
  reference_key: string;
  progress: number;
  updated_at: string;
};

export function MeHistoryClient() {
  const [items, setItems] = useState<Row[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/study-tools/history?limit=100", { credentials: "include" });
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
    const res = await fetch(`/api/study-tools/history?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setItems((list) => (list ?? []).filter((x) => x.id !== id));
  };

  if (items === null) return <p className="mt-8 text-sm text-slate-500">Loading…</p>;
  if (items.length === 0) {
    return <p className="mt-8 text-sm text-slate-500">No history yet. Open chapters or lessons while signed in.</p>;
  }

  return (
    <ul className="mt-8 space-y-3">
      {items.map((h) => (
        <li key={h.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-line/50 bg-soft/15 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{h.content_type}</p>
            <p className="mt-1 break-all font-mono text-xs text-amber-100/85">{h.reference_key}</p>
            <p className="mt-1 text-xs text-slate-600">{new Date(h.updated_at).toLocaleString()}</p>
          </div>
          <button
            type="button"
            onClick={() => void remove(h.id)}
            className="text-xs font-medium text-rose-300/90 hover:underline"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
