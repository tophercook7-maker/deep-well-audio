"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("app global-error:", error.message);
  }, [error]);

  return (
    <html lang="en" className="h-full" style={{ backgroundColor: "#0b1220", color: "#f8fafc" }}>
      <body
        className="min-h-screen antialiased text-slate-100"
        style={{ backgroundColor: "#0b1220", color: "#f8fafc", minHeight: "100vh" }}
      >
        <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Something went wrong</p>
          <h1 className="mt-4 text-2xl font-semibold">This view needs a refresh</h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            A critical error interrupted the app shell. Try reloading or return home from your browser.
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
              className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-slate-200 hover:border-amber-200/50"
            >
              Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
