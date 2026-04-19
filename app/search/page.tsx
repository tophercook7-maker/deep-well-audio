import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { BookOpen, ScrollText, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Scripture and topical studies across Deep Well Audio.",
};

export default function SearchHubPage() {
  return (
    <main className="container-shell py-12 sm:py-16">
      <header className="max-w-2xl border-b border-line/50 pb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Search</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Find Scripture and studies</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Jump into a focused search—Bible verses and references, or topical studies and lessons.
        </p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            href={"/bible/search" as Route}
            className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-line/55 bg-[rgba(12,16,24,0.45)] p-6 transition hover:border-accent/35 hover:bg-soft/25"
          >
            <BookOpen className="h-8 w-8 text-amber-200/85" aria-hidden />
            <div>
              <span className="block text-lg font-semibold text-white">Bible search</span>
              <span className="mt-1 block text-sm text-slate-400">Verses, references, and indexed text</span>
            </div>
          </Link>
        </li>
        <li>
          <Link
            href={"/studies/search" as Route}
            className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-line/55 bg-[rgba(12,16,24,0.45)] p-6 transition hover:border-accent/35 hover:bg-soft/25"
          >
            <ScrollText className="h-8 w-8 text-amber-200/85" aria-hidden />
            <div>
              <span className="block text-lg font-semibold text-white">Study search</span>
              <span className="mt-1 block text-sm text-slate-400">Topics, themes, and lessons</span>
            </div>
          </Link>
        </li>
      </ul>

      <p className="mt-10 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Search className="h-4 w-4 text-slate-600" aria-hidden />
        <span>
          Looking for teaching episodes? Start from{" "}
          <Link href={"/browse" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
            Browse
          </Link>{" "}
          or use the bar at the top anytime.
        </span>
      </p>
    </main>
  );
}
