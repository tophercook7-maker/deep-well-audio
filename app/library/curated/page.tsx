import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { Bookmark, ExternalLink } from "lucide-react";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { canUseFeature } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { listCuratedProgressContinue, listCuratedSaves } from "@/lib/curated/user-data";
import { BackButton } from "@/components/buttons/back-button";
import { LibraryEmptySaved } from "@/components/library/library-empty-saved";
import { isNextDynamicUsageError } from "@/lib/next-runtime";

export const dynamic = "force-dynamic";

function ytWatch(id: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}

export default async function LibraryCuratedPage() {
  let user = null;
  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    user = await getSessionUser();
    plan = await getUserPlan();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  if (!user) {
    redirect("/login?next=/library/curated");
  }

  if (!canUseFeature("curated_library", plan)) {
    redirect("/library");
  }

  const supabase = await createClient();
  if (!supabase) {
    return (
      <main className="container-shell py-12">
        <p className="text-sm text-muted">Library sync is not available (check Supabase configuration).</p>
      </main>
    );
  }

  const [saves, progress] = await Promise.all([
    listCuratedSaves(supabase, user.id, 80),
    listCuratedProgressContinue(supabase, user.id, 40),
  ]);

  const completedRows = await supabase
    .from("curated_video_progress")
    .select("id, youtube_video_id, progress_percent, last_watched_at, completed")
    .eq("user_id", user.id)
    .eq("completed", true)
    .order("updated_at", { ascending: false })
    .limit(40);

  const doneList = (completedRows.data ?? []) as {
    id: string;
    youtube_video_id: string;
    progress_percent: number;
    last_watched_at: string;
    completed: boolean;
  }[];

  return (
    <main className="container-shell space-y-10 py-12 sm:py-14">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/library" label="Library" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Curated study</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Saved teachings & progress</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Private lists from the curated video library. Open a video to watch on YouTube; notes stay in your account—edit them from the card on{" "}
          <Link href={"/curated-teachings" as Route} className="text-amber-200/85 underline-offset-2 hover:underline">
            curated teachings
          </Link>
          .
        </p>
      </header>

      {progress.length > 0 ? (
        <section className="space-y-4" aria-labelledby="curated-continue">
          <h2 id="curated-continue" className="text-lg font-semibold text-white">
            Continue
          </h2>
          <ul className="space-y-2">
            {progress.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/60 bg-[rgba(11,14,18,0.5)] px-4 py-3 backdrop-blur-md"
              >
                <span className="font-mono text-xs text-slate-400">{row.youtube_video_id}</span>
                <a
                  href={ytWatch(row.youtube_video_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-200/85 hover:text-amber-100"
                >
                  Resume
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4" aria-labelledby="curated-saved">
        <h2 id="curated-saved" className="text-lg font-semibold text-white">
          Saved ({saves.length})
        </h2>
        {saves.length === 0 ? (
          <LibraryEmptySaved />
        ) : (
          <ul className="space-y-2">
            {saves.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/60 bg-[rgba(11,14,18,0.5)] px-4 py-3 backdrop-blur-md"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Bookmark className="h-4 w-4 shrink-0 text-amber-200/65" aria-hidden />
                  <span className="truncate text-sm text-slate-200">{row.title_snapshot?.trim() || row.youtube_video_id}</span>
                </span>
                <a
                  href={ytWatch(row.youtube_video_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-200/85 hover:text-amber-100"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {doneList.length > 0 ? (
        <section className="space-y-4" aria-labelledby="curated-done">
          <h2 id="curated-done" className="text-lg font-semibold text-white">
            Marked complete
          </h2>
          <ul className="space-y-2">
            {doneList.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line/40 bg-soft/10 px-4 py-3"
              >
                <span className="font-mono text-xs text-slate-500">{row.youtube_video_id}</span>
                <a
                  href={ytWatch(row.youtube_video_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-amber-200/75 hover:text-amber-100"
                >
                  Open
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
