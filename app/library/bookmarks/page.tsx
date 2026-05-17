import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { Bookmark, NotebookPen, Sparkles } from "lucide-react";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { BackButton } from "@/components/buttons/back-button";
import { getRecentEpisodeNotesForUser } from "@/lib/queries";
import { getRecentSavedMoments } from "@/lib/bookmarks";

export const metadata = {
  title: "Saved Moments & Notes",
  description: "Saved moments and episode notes—a calm record of what stood out.",
};

function formatMomentTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const safe = Math.floor(seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default async function LibraryBookmarksPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/library/bookmarks");
  }
  const plan = await getUserPlan();
  if (plan !== "premium") {
    redirect("/pricing?intent=notes");
  }

  const [notes, moments] = await Promise.all([
    getRecentEpisodeNotesForUser(user.id, 60),
    getRecentSavedMoments(user.id, 60),
  ]);

  return (
    <main className="container-shell space-y-10 py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/library" label="Library" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">Memory</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Saved Moments &amp; Notes</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          The timestamps, phrases, reflections, and episode notes you wanted to keep.
        </p>
        <p className="mt-3 text-sm text-slate-500">This is where your growth becomes visible—quietly, over time.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Memory overview">
        <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Saved moments</p>
          <p className="mt-2 text-2xl font-semibold text-white">{moments.length}</p>
        </div>
        <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Episode notes</p>
          <p className="mt-2 text-2xl font-semibold text-white">{notes.length}</p>
        </div>
        <div className="rounded-[22px] border border-accent/20 bg-amber-200/[0.055] p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">Purpose</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-300/95">Return to what mattered before it scatters.</p>
        </div>
      </section>

      {moments.length === 0 && notes.length === 0 ? (
        <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
          <p className="text-sm leading-relaxed text-muted">
            No saved moments or notes yet. Play a teaching, tap Save Moment in the player, and capture the line, Scripture, or reflection you
            want to revisit.
          </p>
          <Link
            href={"/browse" as Route}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
          >
            Browse teachings
          </Link>
        </div>
      ) : null}

      {moments.length > 0 ? (
        <section className="space-y-4" aria-labelledby="saved-moments-heading">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-amber-200/80" aria-hidden />
            <h2 id="saved-moments-heading" className="text-lg font-semibold text-white">Saved moments</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {moments.map((m) => {
              const href = `/episodes/${m.episode_id}` as Route;
              const title = m.episode.title?.trim() || "Teaching";
              return (
                <Link
                  key={m.id}
                  href={href}
                  className="block rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 transition hover:border-accent/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-amber-200/65">{formatMomentTime(m.seconds)} · Saved moment</p>
                      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{m.episode.show?.title ?? "Deep Well teaching"}</p>
                    </div>
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-200/70" aria-hidden />
                  </div>
                  {m.quote || m.label ? (
                    <p className="mt-4 text-sm leading-relaxed text-slate-300/95">“{m.quote ?? m.label}”</p>
                  ) : null}
                  {m.note ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-400/95">{m.note.length > 220 ? `${m.note.slice(0, 217)}…` : m.note}</p>
                  ) : null}
                  {m.scripture_ref || m.topic ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {m.scripture_ref ? <span className="rounded-full border border-line/55 px-3 py-1 text-xs text-slate-300">{m.scripture_ref}</span> : null}
                      {m.topic ? <span className="rounded-full border border-line/55 px-3 py-1 text-xs text-slate-300">{m.topic}</span> : null}
                    </div>
                  ) : null}
                  <p className="mt-4 text-xs text-slate-500">Saved {new Date(m.created_at).toLocaleString(undefined, { dateStyle: "medium" })}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {notes.length > 0 ? (
        <section className="space-y-4" aria-labelledby="notes-heading">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-amber-200/80" aria-hidden />
            <h2 id="notes-heading" className="text-lg font-semibold text-white">Episode notes</h2>
          </div>
          <ul className="space-y-4">
            {notes.map((n) => {
              const href = `/episodes/${n.episode_id}` as Route;
              const title = n.episode_title?.trim() || "Teaching";
              const preview = n.body.replace(/\s+/g, " ").trim().slice(0, 220);
              return (
                <li key={n.id}>
                  <Link
                    href={href}
                    className="block rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-6 transition hover:border-accent/30"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-200/65">Episode note</p>
                    <p className="mt-2 text-sm font-medium text-white">{title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300/95">{preview}{n.body.length > 220 ? "…" : ""}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Updated {new Date(n.updated_at).toLocaleString(undefined, { dateStyle: "medium" })}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
