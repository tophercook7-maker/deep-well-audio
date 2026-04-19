"use client";

import Link from "next/link";
import type { Route } from "next";
import type { BibleApiVerse } from "@/lib/study/bible-api";
import { BookOpen, Headphones, Highlighter, StickyNote } from "lucide-react";

const HIGHLIGHTS = ["yellow", "green", "blue", "pink", "purple"] as const;

type Props = {
  activeRef: string;
  sel: BibleApiVerse | null;
  signedIn: boolean;
  noteDraft: string;
  onNoteChange: (v: string) => void;
  onNoteBlur: () => void;
  onHighlight: (color: string) => void;
  listenHref: Route;
  compact?: boolean;
};

export function BibleStudyPanel({
  activeRef,
  sel,
  signedIn,
  noteDraft,
  onNoteChange,
  onNoteBlur,
  onHighlight,
  listenHref,
  compact = false,
}: Props) {
  const pad = compact ? "p-3" : "p-4";

  /** Mobile dock: opaque dark chrome. Desktop: warm panels that echo the paper reader. */
  const refBox = compact
    ? `rounded-2xl border border-stone-600 bg-stone-950 ${pad}`
    : `rounded-2xl border border-stone-400/60 bg-[#ebe6dc] ${pad}`;
  const refLabel = compact ? "text-xs text-stone-500" : "text-xs text-stone-600";
  const refMono = compact ? "mt-1.5 break-all font-mono text-[11px] leading-relaxed text-stone-200" : "mt-1.5 break-all font-mono text-[11px] leading-relaxed text-stone-800";
  const refHint = compact ? "mt-2 text-xs text-stone-500" : "mt-2 text-xs text-stone-600";

  const cardBorder = compact ? "border-stone-600 bg-stone-950" : "border-stone-400/50 bg-[#ebe6dc]";
  const sectionLabel = compact ? "text-xs font-medium text-stone-400" : "text-xs font-medium text-stone-600";
  const listenCard = compact
    ? "flex items-center gap-2 rounded-xl border border-stone-600 bg-stone-900 px-4 py-3 text-sm text-stone-100 transition hover:border-stone-500"
    : "flex items-center gap-2 rounded-xl border border-stone-500/60 bg-stone-900 px-4 py-3 text-sm text-stone-100 shadow-sm transition hover:border-stone-400";

  const noteArea = compact
    ? "mt-2 min-h-[88px] w-full rounded-xl border border-stone-600 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
    : "mt-2 min-h-[88px] w-full rounded-xl border border-stone-400/80 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-500 shadow-inner outline-none focus:border-amber-600/50 focus:ring-1 focus:ring-amber-500/20";

  const linkClass = compact
    ? "text-amber-200 underline-offset-2 hover:text-amber-100 hover:underline"
    : "font-medium text-amber-900 underline-offset-2 hover:text-amber-950 hover:underline";

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {!compact ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Study</p>
      ) : null}
      <div className={refBox}>
        <p className={refLabel}>Reference</p>
        <p className={refMono}>{activeRef}</p>
        {sel ? (
          <p className={refHint}>
            Verse {sel.verse} · {signedIn ? "Synced to your account" : "Saved on this device"}
          </p>
        ) : (
          <p className={refHint}>Select a verse for highlights and notes.</p>
        )}
      </div>
      <Link href={listenHref} className={listenCard}>
        <Headphones className={`h-4 w-4 shrink-0 ${compact ? "text-amber-300" : "text-amber-200"}`} aria-hidden />
        Listen along
      </Link>
      <div className={`rounded-2xl border ${cardBorder} ${pad}`}>
        <p className={`flex items-center gap-2 ${sectionLabel}`}>
          <Highlighter className="h-3.5 w-3.5" aria-hidden />
          Highlight
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HIGHLIGHTS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              disabled={!sel}
              onClick={() => onHighlight(c)}
              className={[
                "h-9 w-9 rounded-full border-2 border-stone-900/20 disabled:opacity-35",
                c === "yellow" && "bg-yellow-300/90",
                c === "green" && "bg-emerald-400/90",
                c === "blue" && "bg-sky-400/90",
                c === "pink" && "bg-pink-400/90",
                c === "purple" && "bg-violet-500/90",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      </div>
      <div className={`rounded-2xl border ${cardBorder} ${pad}`}>
        <p className={`flex items-center gap-2 ${sectionLabel}`}>
          <StickyNote className="h-3.5 w-3.5" aria-hidden />
          Note
        </p>
        <textarea
          disabled={!sel}
          placeholder={sel ? "Jot a thought…" : "Select a verse first"}
          className={noteArea}
          value={noteDraft}
          onChange={(e) => onNoteChange(e.target.value)}
          onBlur={() => onNoteBlur()}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href={"/me/highlights" as Route} className={linkClass}>
          My highlights
        </Link>
        <Link href={"/me/notes" as Route} className={linkClass}>
          My notes
        </Link>
      </div>
      <Link href={"/studies" as Route} className={`inline-flex items-center gap-2 text-sm ${linkClass}`}>
        <BookOpen className="h-4 w-4" aria-hidden />
        Topical studies
      </Link>
    </div>
  );
}
