"use client";

import Link from "next/link";
import type { Route } from "next";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlayer } from "@/lib/player/context";
import { FALLBACK_ARTWORK_PATH, normalizeArtworkSrc } from "@/lib/artwork";
import {
  getContinueListeningEntries,
  LISTENING_PROGRESS_EVENT,
  type ListeningProgressEntry,
  trackWithResume,
} from "@/lib/listening-progress";
import { CTA } from "@/lib/site-messaging";

function rowProgressPct(entry: ListeningProgressEntry): number {
  const dur =
    entry.duration > 0
      ? entry.duration
      : entry.track.durationSeconds && entry.track.durationSeconds > 0
        ? entry.track.durationSeconds
        : 0;
  if (dur <= 0) return 0;
  return Math.min(100, (entry.currentTime / dur) * 100);
}

export function ContinueListeningSection({
  className = "",
  enabled = true,
}: {
  className?: string;
  /** When false, section is hidden (e.g. guests — progress is a signed-in feature). */
  enabled?: boolean;
}) {
  const { playTrack } = usePlayer();
  const [entries, setEntries] = useState<ListeningProgressEntry[]>([]);

  useEffect(() => {
    const load = () => {
      setEntries(getContinueListeningEntries(5).filter((e) => Boolean(e.track.playbackUrl)));
    };
    load();
    if (typeof window === "undefined") return;
    window.addEventListener(LISTENING_PROGRESS_EVENT, load);
    return () => window.removeEventListener(LISTENING_PROGRESS_EVENT, load);
  }, []);

  if (!enabled) return null;

  if (entries.length === 0) {
    return (
      <section
        className={`w-full pb-6 pt-0 sm:pb-8 sm:pt-0 ${className}`.trim()}
        aria-labelledby="continue-listening-heading"
      >
        <div className="card border-line/90 bg-soft/25 p-6 sm:p-7">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Your session</p>
            <h2 id="continue-listening-heading" className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Continue where you left off
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Start listening and we&apos;ll keep your place on this account.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={"/browse" as Route}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
              >
                {CTA.LISTEN_FREE}
              </Link>
              <Link
                href={"/library" as Route}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
              >
                Your Library
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full pb-6 pt-0 sm:pb-8 sm:pt-0 ${className}`.trim()}
      aria-labelledby="continue-listening-heading"
    >
      <div className="card border-line/90 bg-soft/25 p-6 sm:p-7">
        <div className="mb-5 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Your session</p>
          <h2 id="continue-listening-heading" className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Continue where you left off
          </h2>
          <p className="mt-1.5 text-sm text-muted">Resume your last teaching—progress syncs on this device.</p>
        </div>
        <ul className="space-y-4">
          {entries.map((entry) => {
            const art = normalizeArtworkSrc(entry.track.artworkUrl) ?? FALLBACK_ARTWORK_PATH;
            const pct = rowProgressPct(entry);
            const href = `/episodes/${entry.track.id}` as Route;
            const showHref = entry.track.showSlug ? (`/shows/${entry.track.showSlug}` as Route) : null;
            return (
              <li
                key={entry.track.id}
                className="flex flex-col gap-3 rounded-2xl border border-line/70 bg-bg/60 p-4 sm:flex-row sm:items-center sm:gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-xl border border-line/80 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-50">{entry.track.title}</p>
                  <p className="truncate text-xs text-amber-100/75">{entry.track.subtitle}</p>
                  <div
                    className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line/80"
                    role="progressbar"
                    aria-label="Playback progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(pct)}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent/90 to-amber-200/85"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
                  <button
                    type="button"
                    onClick={() => playTrack(trackWithResume(entry))}
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1220] sm:min-h-0"
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden />
                    Resume
                  </button>
                  <Link
                    href={href}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-4 py-2 text-sm text-muted transition hover:border-accent/35 hover:text-white sm:min-h-0"
                  >
                    Episode
                  </Link>
                  {showHref ? (
                    <Link
                      href={showHref}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-4 py-2 text-sm text-muted transition hover:border-accent/35 hover:text-white sm:min-h-0"
                    >
                      Show
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
