import Link from "next/link";
import type { Route } from "next";
import { Bookmark, Clapperboard, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listCuratedProgressContinue, listCuratedSaves } from "@/lib/curated/user-data";

function ytWatch(id: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}

export async function LibraryCuratedStudySection({ userId }: { userId: string }) {
  const supabase = await createClient();
  if (!supabase) return null;

  const [saves, progress] = await Promise.all([
    listCuratedSaves(supabase, userId, 8),
    listCuratedProgressContinue(supabase, userId, 5),
  ]);

  if (saves.length === 0 && progress.length === 0) {
    return (
      <section className="card border-line/75 bg-[rgba(11,14,18,0.5)] p-6 backdrop-blur-md sm:p-8" aria-labelledby="lib-curated-empty">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            <Clapperboard className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/75">Curated study</p>
            <h2 id="lib-curated-empty" className="mt-1 text-lg font-semibold text-white">
              Saved teachings will gather here
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              From any curated video card, use <span className="text-slate-400">Save</span> or <span className="text-slate-400">Notes</span>—private
              to your account, tied to that teaching.
            </p>
            <Link
              href={"/curated-teachings" as Route}
              className="mt-4 inline-flex text-sm font-medium text-amber-200/85 underline-offset-2 hover:text-amber-100 hover:underline"
            >
              Open curated library →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8" aria-labelledby="lib-curated-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">Curated study</p>
          <h2 id="lib-curated-heading" className="mt-1 text-xl font-semibold text-white sm:text-2xl">
            Teachings you marked
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Bookmarks and “continue” picks from the curated video library (not podcast episodes).
          </p>
        </div>
        <Link
          href={"/library/curated" as Route}
          className="text-sm font-medium text-amber-200/85 hover:text-amber-100 hover:underline"
        >
          View all →
        </Link>
      </div>

      {progress.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Continue</p>
          <ul className="space-y-2">
            {progress.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/60 bg-[rgba(11,14,18,0.45)] px-4 py-3 backdrop-blur-md"
              >
                <span className="font-mono text-[11px] text-slate-500">{row.youtube_video_id}</span>
                <span className="text-xs text-slate-500">
                  {row.progress_percent > 0 ? `${row.progress_percent}% · ` : ""}
                  {new Date(row.last_watched_at).toLocaleDateString()}
                </span>
                <a
                  href={ytWatch(row.youtube_video_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-200/85 hover:text-amber-100"
                >
                  Open
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {saves.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Saved</p>
          <ul className="space-y-2">
            {saves.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/60 bg-[rgba(11,14,18,0.45)] px-4 py-3 backdrop-blur-md"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Bookmark className="h-3.5 w-3.5 shrink-0 text-amber-200/60" aria-hidden />
                  <span className="truncate text-sm text-slate-200">
                    {row.title_snapshot?.trim() || row.youtube_video_id}
                  </span>
                </span>
                <a
                  href={ytWatch(row.youtube_video_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-200/85 hover:text-amber-100"
                >
                  Watch
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
