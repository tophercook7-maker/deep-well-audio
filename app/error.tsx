"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app error:", error.message);
  }, [error]);

  return (
    <main className="container-shell py-24">
      <div className="card mx-auto max-w-lg p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Something went wrong</p>
        <h1 className="mt-4 text-2xl font-semibold text-white">We couldn&apos;t finish loading this view</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          The page hit an unexpected error. You can try again or return home—your data is safe.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-slate-950 hover:opacity-90"
          >
            Try again
          </button>
          <Link
            href={"/" as Route}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-muted hover:border-accent/40 hover:text-white"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
