import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { BackButton } from "@/components/buttons/back-button";
import { getRecentEpisodeNotesForUser } from "@/lib/queries";

export const metadata = {
  title: "Your notes",
  description: "Episode notes you saved with teachings—a calm record of what stood out.",
};

export default async function LibraryBookmarksPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/library/bookmarks");
  }
  const plan = await getUserPlan();
  if (plan !== "premium") {
    redirect("/pricing?intent=notes");
  }

  const notes = await getRecentEpisodeNotesForUser(user.id, 60);

  return (
    <main className="container-shell space-y-10 py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/library" label="Library" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">Notes</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your notes</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">A record of what stood out to you.</p>
        <p className="mt-3 text-sm text-slate-500">This is where your growth becomes visible—quietly, over time.</p>
      </header>

      {notes.length === 0 ? (
        <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
          <p className="text-sm leading-relaxed text-muted">
            No episode notes yet. Open a teaching, scroll to bookmarks &amp; notes, and write what you want to remember—your words stay with that
            episode.
          </p>
          <Link
            href={"/browse" as Route}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
          >
            Browse teachings
          </Link>
        </div>
      ) : (
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
      )}
    </main>
  );
}
