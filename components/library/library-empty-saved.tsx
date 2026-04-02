import Link from "next/link";
import type { Route } from "next";

export function LibraryEmptySaved() {
  return (
    <div className="card max-w-xl p-8">
      <h2 className="text-xl font-semibold text-white">Nothing saved yet</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">Start listening and save what helps</p>
      <Link
        href={"/explore" as Route}
        className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-line/90 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-accent/35 hover:text-white"
      >
        Browse teaching →
      </Link>
    </div>
  );
}
