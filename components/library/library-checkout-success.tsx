"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LibraryCheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const upgraded = searchParams.get("upgraded") === "true";

  useEffect(() => {
    if (!upgraded) return;
    const t = window.setTimeout(() => {
      router.replace("/library");
    }, 8000);
    return () => window.clearTimeout(t);
  }, [upgraded, router]);

  if (!upgraded) return null;

  return (
    <div
      className="card border-accent/40 bg-gradient-to-b from-accent/[0.1] via-accent/[0.05] to-soft/10 px-6 py-6 text-sm leading-relaxed text-slate-100 shadow-[0_14px_48px_-24px_rgba(212,175,55,0.22)] sm:px-7 sm:py-7"
      role="status"
      aria-live="polite"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/75">Welcome</p>
      <p className="mt-2 text-lg font-semibold text-white">You&apos;re Premium now</p>
      <p className="mt-2 max-w-prose text-slate-400">
        Bookmarks, notes, topic packs, World Watch, and advanced filters are on this account. Refresh if something looks out of date—thank you for
        supporting this work.
      </p>
      <p className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
        <Link
          href={"/world-watch" as Route}
          className="inline-flex min-h-[44px] items-center rounded-full border border-accent/35 bg-accent/[0.08] px-4 py-2 text-amber-100/95 transition hover:border-accent/50"
        >
          Open World Watch
        </Link>
        <Link
          href={"/library" as Route}
          className="inline-flex min-h-[44px] items-center text-amber-200/85 underline-offset-2 transition hover:text-amber-100 hover:underline"
        >
          Open your library
        </Link>
        <Link href={"/explore" as Route} className="inline-flex min-h-[44px] items-center text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline">
          Explore catalog
        </Link>
      </p>
    </div>
  );
}
