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
      className="card border-accent/35 bg-accent/[0.08] px-6 py-5 text-sm leading-relaxed text-slate-100 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.5)] sm:py-6"
      role="status"
      aria-live="polite"
    >
      <p className="font-semibold text-amber-100/95">You&apos;re now a Premium member</p>
      <p className="mt-1 text-muted">
        Thank you for supporting Deep Well Audio. Bookmarks, notes, topic packs, World Watch, and advanced filters are on your account—refresh if
        something doesn&apos;t appear right away.
      </p>
      <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
        <Link href={"/world-watch" as Route} className="text-amber-200/90 underline-offset-2 hover:text-amber-100 hover:underline">
          Open World Watch
        </Link>
        <Link href={"/explore" as Route} className="text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline">
          Explore catalog
        </Link>
      </p>
    </div>
  );
}
