"use client";

import Link from "next/link";
import type { Route } from "next";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayer } from "@/lib/player/context";
import { FALLBACK_ARTWORK_PATH, normalizeArtworkSrc } from "@/lib/artwork";
import {
  getRecentlyPlayedEntries,
  LISTENING_PROGRESS_EVENT,
  type ListeningProgressEntry,
  trackWithResume,
} from "@/lib/listening-progress";

export function RecentlyPlayedSection({ className = "" }: { className?: string }) {
  const { playTrack } = usePlayer();
  const [entries, setEntries] = useState<ListeningProgressEntry[]>([]);

  useEffect(() => {
    const load = () => {
      setEntries(getRecentlyPlayedEntries(8).filter((e) => Boolean(e.track.playbackUrl)));
    };
    load();
    if (typeof window === "undefined") return;
    window.addEventListener(LISTENING_PROGRESS_EVENT, load);
    return () => window.removeEventListener(LISTENING_PROGRESS_EVENT, load);
  }, []);

  if (entries.length === 0) return null;

  return (
    <section
      className={`container-shell pb-8 pt-0 sm:pb-10 ${className}`.trim()}
      aria-labelledby="recently-played-heading"
    >
      <div className="rounded-2xl border border-line/70 bg-soft/15 px-5 py-5 sm:px-6">
        <h2 id="recently-played-heading" className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200/70">
          Recently played
        </h2>
        <ul className="mt-4 divide-y divide-line/50">
          {entries.map((entry) => {
            const art = normalizeArtworkSrc(entry.track.artworkUrl) ?? FALLBACK_ARTWORK_PATH;
            const href = `/episodes/${entry.track.id}` as Route;
            return (
              <li key={entry.track.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-lg border border-line/80 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link href={href} className="block truncate text-sm font-medium text-slate-100 hover:text-amber-100">
                    {entry.track.title}
                  </Link>
                  <p className="truncate text-xs text-muted">{entry.track.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => playTrack(trackWithResume(entry))}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line/90 text-accent transition hover:border-accent/40 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220]"
                  aria-label={`Play ${entry.track.title}`}
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
