import Link from "next/link";
import type { Route } from "next";
import { BookOpen, Sparkles } from "lucide-react";
import { getSessionUser, getUserPlan } from "@/lib/auth";
import { BackButton } from "@/components/buttons/back-button";

export const metadata = {
  title: "Library",
  description: "Your Deep Well library hub—saved teaching, bookmarks, and study continuity.",
};

export default async function LibraryPage() {
  const user = await getSessionUser();
  const plan = await getUserPlan();

  return (
    <main className="container-shell space-y-10 py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/85">Library</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Your listening &amp; study hub</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Deep Well Study connects what you hear with Scripture you can read calmly—without turning the site into a busy research app.
        </p>
      </header>

      {!user ? (
        <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
          <p className="text-sm text-muted">
            <Link href={"/login?next=/library" as Route} className="font-medium text-amber-200/85 hover:underline">
              Sign in
            </Link>{" "}
            to keep saves and notes, or{" "}
            <Link href={"/pricing" as Route} className="font-medium text-amber-200/85 hover:underline">
              view Premium
            </Link>{" "}
            for the full library.
          </p>
        </div>
      ) : plan !== "premium" ? (
        <div className="rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md">
          <p className="text-sm leading-relaxed text-muted">
            You&apos;re signed in. Premium unlocks your personal library, episode bookmarks, full World Watch, and saved study notes across
            teachings and verses.
          </p>
          <Link
            href={"/pricing" as Route}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
          >
            View Premium
          </Link>
          <Link
            href={"/browse" as Route}
            className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-full border border-line/90 px-6 py-2.5 text-sm font-medium text-slate-100 transition hover:border-accent/35 hover:text-white"
          >
            Browse teaching
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href={"/dashboard" as Route}
            className="group flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md transition hover:border-accent/35"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
              <Sparkles className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">Subscriber dashboard</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">Continue listening, notes, World Watch, and the Study hub in one calm place.</p>
            <span className="mt-5 text-sm font-medium text-amber-200/85 group-hover:underline">Open dashboard</span>
          </Link>

          <Link
            href={"/dashboard#study" as Route}
            className="group flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md transition hover:border-sky-400/35"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/[0.1] text-sky-100">
              <BookOpen className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-white">Study hub</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">Saved verses, recent notes, and the last passage you opened.</p>
            <span className="mt-5 text-sm font-medium text-sky-200/85 group-hover:underline">Open Study</span>
          </Link>

          <Link
            href={"/dashboard#notes" as Route}
            className="group flex flex-col rounded-[22px] border border-line/55 bg-[rgba(9,12,18,0.45)] p-8 backdrop-blur-md transition hover:border-accent/35 md:col-span-2"
          >
            <h2 className="text-xl font-semibold text-white">Bookmarks &amp; episode notes</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">Episode tools from your library flow live on the dashboard.</p>
            <span className="mt-4 text-sm font-medium text-amber-200/85 group-hover:underline">Go to notes</span>
          </Link>
        </div>
      )}
    </main>
  );
}
