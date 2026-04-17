"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useState } from "react";
import { getRecentlyPlayedEntries, LISTENING_PROGRESS_EVENT } from "@/lib/listening-progress";

type ActivityRow = {
  id: string;
  label: string;
  sub: string;
  href: Route;
  at: number;
  kind: "play" | "note" | "passage";
};

function kindLabel(kind: ActivityRow["kind"]): string {
  if (kind === "play") return "Listened";
  if (kind === "note") return "Note";
  return "Saved passage";
}

export function RecentActivityStrip({ plan }: { plan: "guest" | "free" | "premium" }) {
  const [rows, setRows] = useState<ActivityRow[]>([]);

  const load = useCallback(async () => {
      const plays = getRecentlyPlayedEntries(5).map((e) => ({
        id: `play-${e.track.id}`,
        label: e.track.title,
        sub: e.track.subtitle,
        href: `/episodes/${e.track.id}` as Route,
        at: e.lastPlayedAt ?? 0,
        kind: "play" as const,
      }));

      const extra: ActivityRow[] = [];
      if (plan === "premium") {
        try {
          const res = await fetch("/api/study/dashboard", { credentials: "include" });
          if (res.ok) {
            const data = (await res.json()) as {
              recentNotes?: Array<{ id: string; body: string; updated_at: string }>;
              savedVerses?: Array<{ id: string; passage_label?: string | null; book_name: string; created_at: string }>;
            };
            for (const n of data.recentNotes?.slice(0, 3) ?? []) {
              const at = Date.parse(n.updated_at);
              extra.push({
                id: `note-${n.id}`,
                label: n.body.trim().slice(0, 72) + (n.body.length > 72 ? "…" : ""),
                sub: "Study note",
                href: "/library#bible-study" as Route,
                at: Number.isFinite(at) ? at : 0,
                kind: "note",
              });
            }
            for (const v of data.savedVerses?.slice(0, 3) ?? []) {
              const at = Date.parse(v.created_at);
              const title = (v.passage_label ?? `${v.book_name}`).trim();
              extra.push({
                id: `sv-${v.id}`,
                label: title,
                sub: "Bible Study",
                href: "/library#bible-study" as Route,
                at: Number.isFinite(at) ? at : 0,
                kind: "passage",
              });
            }
          }
        } catch {
          /* ignore */
        }
      }

      const merged = [...plays, ...extra].sort((a, b) => b.at - a.at).slice(0, 5);
      setRows(merged);
  }, [plan]);

  useEffect(() => {
    void load();
    window.addEventListener(LISTENING_PROGRESS_EVENT, load);
    return () => window.removeEventListener(LISTENING_PROGRESS_EVENT, load);
  }, [load]);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line/50 bg-[rgba(8,11,16,0.3)] px-4 py-4 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Recent activity</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          When you listen or save something, a short trail will show up here—quiet proof you&apos;ve already started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.35)] px-4 py-4 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Recent activity</p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((r) => (
          <li key={r.id}>
            <Link
              href={r.href}
              className="group flex flex-col gap-0.5 rounded-xl border border-transparent px-1 py-1 transition hover:border-line/40 hover:bg-white/[0.03]"
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{kindLabel(r.kind)}</span>
              <span className="line-clamp-2 text-sm font-medium text-slate-100 group-hover:text-white">{r.label}</span>
              <span className="line-clamp-1 text-xs text-slate-500">{r.sub}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
