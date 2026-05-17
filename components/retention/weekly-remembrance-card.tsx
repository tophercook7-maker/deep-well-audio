import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, Feather, Sparkles } from "lucide-react";
import type { SavedMomentWithEpisode } from "@/lib/bookmarks";

type ThemeChip = {
  theme: string;
  count: number;
};

type WeeklyRemembranceCardProps = {
  savedTeachingCount: number;
  savedMoments: SavedMomentWithEpisode[];
  themes: ThemeChip[];
  latestWorldWatchTitle?: string | null;
};

function formatMomentTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const safe = Math.floor(seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function pickReflectionLine(savedMoments: SavedMomentWithEpisode[], themes: ThemeChip[]) {
  if (themes.length >= 2) {
    return `Your recent saved moments are circling ${themes[0].theme.toLowerCase()} and ${themes[1].theme.toLowerCase()}.`;
  }
  if (themes.length === 1) {
    return `Your recent saved moments are circling ${themes[0].theme.toLowerCase()}.`;
  }
  if (savedMoments.length > 0) {
    return "You have saved moments ready to revisit when you want to remember what stood out.";
  }
  return "Save one meaningful timestamp this week and Deep Well will start building a quiet thread of remembrance.";
}

export function WeeklyRemembranceCard({
  savedTeachingCount,
  savedMoments,
  themes,
  latestWorldWatchTitle,
}: WeeklyRemembranceCardProps) {
  const featured = savedMoments[0] ?? null;
  const reflectionLine = pickReflectionLine(savedMoments, themes);

  return (
    <section
      className="rounded-[28px] border border-accent/20 bg-[rgba(10,14,20,0.52)] p-6 shadow-[0_28px_70px_-44px_rgba(212,175,55,0.32)] backdrop-blur-md sm:p-8"
      aria-labelledby="weekly-remembrance-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-100/85">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            Weekly remembrance
          </p>
          <h2 id="weekly-remembrance-heading" className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            A quiet look at what has been staying with you.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400/95 sm:text-base">
            {reflectionLine} This space is meant to help you return without pressure, not chase another streak.
          </p>
        </div>
        <Link
          href={"/library/bookmarks" as Route}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
        >
          Open memory archive
        </Link>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <div className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.42)] p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Saved teachings</p>
          <p className="mt-2 text-2xl font-semibold text-white">{savedTeachingCount.toLocaleString()}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">Teaching you wanted close enough to return to.</p>
        </div>
        <div className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.42)] p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Saved moments</p>
          <p className="mt-2 text-2xl font-semibold text-white">{savedMoments.length}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">Recent fragments of teaching, Scripture, and reflection.</p>
        </div>
        <div className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.42)] p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Current thread</p>
          <p className="mt-2 text-sm font-semibold text-white">{themes[0]?.theme ?? "Ready to form"}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">The pattern will get clearer as you save more moments.</p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.34)] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-amber-200/80" aria-hidden />
            A moment to carry forward
          </div>
          {featured ? (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {formatMomentTime(featured.seconds)} · {featured.episode.show?.title ?? "Saved teaching"}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{featured.episode.title}</p>
              {featured.quote || featured.label ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-300/95">“{featured.quote ?? featured.label}”</p>
              ) : featured.note ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-300/95">{featured.note}</p>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-400/95">
                  You saved this place in the teaching. Add a note later if you want to remember why.
                </p>
              )}
              <Link
                href={`/episodes/${featured.episode.id}` as Route}
                className="mt-5 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:underline"
              >
                Return to the teaching
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Save a moment from the player and this card will bring one back here for quiet review.
            </p>
          )}
        </div>

        <div className="rounded-[22px] border border-line/55 bg-[rgba(8,11,18,0.34)] p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Feather className="h-4 w-4 text-amber-200/80" aria-hidden />
            Gentle next step
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-400/95">
            {latestWorldWatchTitle
              ? `Read the latest World Watch when you want wider context: ${latestWorldWatchTitle}`
              : "Choose one saved moment, sit with it for a minute, and write a single sentence about why it mattered."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {themes.slice(0, 3).map((item) => (
              <span key={item.theme} className="rounded-full border border-amber-200/15 bg-amber-200/[0.06] px-3 py-1.5 text-xs text-amber-100/85">
                {item.theme}
              </span>
            ))}
            {themes.length === 0 ? (
              <span className="rounded-full border border-line/55 px-3 py-1.5 text-xs text-slate-400">No pressure. Begin small.</span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
