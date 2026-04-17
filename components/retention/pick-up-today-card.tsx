"use client";

import Link from "next/link";
import type { Route } from "next";
import { BookMarked, Compass, Headphones } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayer } from "@/lib/player/context";
import { FALLBACK_ARTWORK_PATH, normalizeArtworkSrc } from "@/lib/artwork";
import {
  getContinueListeningEntries,
  LISTENING_PROGRESS_EVENT,
  trackWithResume,
  type ListeningProgressEntry,
} from "@/lib/listening-progress";
import { getLastOpenedTopicSlug } from "@/lib/last-topic-client";
import { getTopicDefinition } from "@/lib/topics";

export function PickUpTodayCard({
  plan,
  /** Hide the “continue last teaching” row when a larger Continue module is shown above. */
  hideContinueRow = false,
}: {
  plan: "guest" | "free" | "premium";
  hideContinueRow?: boolean;
}) {
  const { playTrack } = usePlayer();
  const [entry, setEntry] = useState<ListeningProgressEntry | null>(null);
  const [topicSlug, setTopicSlug] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const rows = getContinueListeningEntries(1).filter((e) => Boolean(e.track.playbackUrl));
      setEntry(rows[0] ?? null);
    };
    sync();
    setTopicSlug(getLastOpenedTopicSlug());
    window.addEventListener(LISTENING_PROGRESS_EVENT, sync);
    return () => window.removeEventListener(LISTENING_PROGRESS_EVENT, sync);
  }, []);

  const topicMeta = topicSlug ? getTopicDefinition(topicSlug) : null;
  const browseTopicHref =
    topicMeta ? (`/browse?topic=${encodeURIComponent(topicMeta.slug)}&view=episodes` as Route) : ("/browse" as Route);

  return (
    <div className="rounded-2xl border border-line/55 bg-[rgba(9,12,18,0.4)] p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/65">Today</p>
      <h2 className="mt-2 text-lg font-semibold text-white">Pick up where you want</h2>
      <p className="mt-1 text-sm text-muted">Three calm entry points—no pressure, just direction.</p>
      <ul className="mt-5 space-y-3">
        {hideContinueRow ? null : (
        <li>
          {entry ? (
            <button
              type="button"
              onClick={() => playTrack(trackWithResume(entry))}
              className="flex w-full items-center gap-3 rounded-2xl border border-line/60 bg-bg/50 p-3 text-left transition hover:border-accent/35 hover:bg-bg/70"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeArtworkSrc(entry.track.artworkUrl) ?? FALLBACK_ARTWORK_PATH}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-xl border border-line/80 object-cover"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">
                  <Headphones className="h-3.5 w-3.5" aria-hidden />
                  Continue last teaching
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-white">{entry.track.title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{entry.track.subtitle}</span>
              </span>
            </button>
          ) : (
            <Link
              href={"/browse" as Route}
              className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line/55 bg-bg/40 p-3 text-left transition hover:border-accent/35"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line/70 bg-soft/30">
                <Headphones className="h-5 w-5 text-amber-200/80" aria-hidden />
              </span>
              <span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">Continue last teaching</span>
                <span className="mt-1 block text-sm text-slate-300">Start listening—your place will be remembered.</span>
              </span>
            </Link>
          )}
        </li>
        )}
        <li>
          <Link
            href={plan === "guest" ? ("/login?next=/library" as Route) : ("/library" as Route)}
            className="flex items-start gap-3 rounded-2xl border border-line/55 bg-bg/40 p-3 transition hover:border-accent/35"
          >
            <BookMarked className="mt-0.5 h-5 w-5 shrink-0 text-accent/90" aria-hidden />
            <span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">Return to saved</span>
              <span className="mt-1 block text-sm text-slate-200">Open Your Library—teachings and notes you kept.</span>
            </span>
          </Link>
        </li>
        <li>
          <Link
            href={browseTopicHref}
            className="flex items-start gap-3 rounded-2xl border border-line/55 bg-bg/40 p-3 transition hover:border-accent/35"
          >
            <Compass className="mt-0.5 h-5 w-5 shrink-0 text-sky-200/80" aria-hidden />
            <span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/70">
                {topicMeta ? `Explore · ${topicMeta.label}` : "Explore a topic"}
              </span>
              <span className="mt-1 block text-sm text-slate-200">
                {topicMeta ? "Return to a theme you were already walking through." : "Browse topics and see what fits today."}
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
