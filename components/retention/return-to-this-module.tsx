"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { FALLBACK_ARTWORK_PATH, normalizeArtworkSrc } from "@/lib/artwork";
import {
  getContinueListeningEntries,
  LISTENING_PROGRESS_EVENT,
  type ListeningProgressEntry,
} from "@/lib/listening-progress";

type FavItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  created_at: string;
};

type Row =
  | { kind: "continue"; key: string; title: string; subtitle: string; href: Route; art?: string | null }
  | { kind: "saved"; key: string; title: string; subtitle: string; href: Route; art?: string | null };

const MAX_CONTINUE = 4;
const MAX_ROWS = 6;

function mergeRows(continues: ListeningProgressEntry[], saves: FavItem[]): Row[] {
  const seen = new Set<string>();
  const out: Row[] = [];
  let continueAdded = 0;
  for (const e of continues) {
    const id = e.track.id;
    if (!id || seen.has(id)) continue;
    if (continueAdded >= MAX_CONTINUE) break;
    seen.add(id);
    continueAdded += 1;
    out.push({
      kind: "continue",
      key: `c-${id}`,
      title: e.track.title,
      subtitle: e.track.subtitle || "In progress",
      href: `/episodes/${id}` as Route,
      art: e.track.artworkUrl,
    });
  }
  for (const s of saves) {
    if (out.length >= MAX_ROWS) break;
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push({
      kind: "saved",
      key: `s-${s.id}`,
      title: s.title,
      subtitle: s.subtitle || "Saved",
      href: s.href as Route,
    });
  }
  return out;
}

export function ReturnToThisModule({ className = "" }: { className?: string }) {
  const [rows, setRows] = useState<Row[]>([]);

  const load = useMemo(
    () => async () => {
      const cont = getContinueListeningEntries(6).filter((e) => Boolean(e.track.playbackUrl));
      let saves: FavItem[] = [];
      try {
        const res = await fetch("/api/library/recent-favorites", { credentials: "include" });
        if (res.ok) {
          const j = (await res.json()) as { items?: FavItem[] };
          saves = j.items ?? [];
        }
      } catch {
        /* ignore */
      }
      setRows(mergeRows(cont, saves));
    },
    []
  );

  useEffect(() => {
    void load();
    window.addEventListener(LISTENING_PROGRESS_EVENT, load);
    return () => window.removeEventListener(LISTENING_PROGRESS_EVENT, load);
  }, [load]);

  if (rows.length === 0) return null;

  return (
    <section
      className={`rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.4)] p-5 backdrop-blur-md sm:p-6 ${className}`.trim()}
      aria-labelledby="return-to-this-heading"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Continuity</p>
      <h2 id="return-to-this-heading" className="mt-2 text-lg font-semibold text-white">
        Return to this
      </h2>
      <p className="mt-1 text-sm text-slate-500">Pick up mid-teaching or open something you saved recently.</p>
      <ul className="mt-4 divide-y divide-line/45 rounded-xl border border-line/40 bg-[rgba(8,11,16,0.35)]">
        {rows.map((r) => {
          const art = normalizeArtworkSrc(r.art) ?? FALLBACK_ARTWORK_PATH;
          return (
            <li key={r.key} className="flex items-center gap-3 px-3 py-3 sm:px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={art} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-lg border border-line/70 object-cover" />
              <div className="min-w-0 flex-1">
                <Link href={r.href} className="block truncate text-sm font-medium text-slate-100 hover:text-amber-100">
                  {r.title}
                </Link>
                <p className="truncate text-xs text-muted">
                  {r.kind === "continue" ? "In progress · " : "Saved · "}
                  {r.subtitle}
                </p>
              </div>
              <Link
                href={r.href}
                className="shrink-0 rounded-full border border-line/80 px-3 py-1.5 text-xs font-medium text-amber-100/90 transition hover:border-accent/35 hover:text-white"
              >
                Open
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
