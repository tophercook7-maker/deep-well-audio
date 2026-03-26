"use client";

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
      className="card border-accent/35 bg-accent/[0.08] px-5 py-4 text-sm leading-relaxed text-slate-100 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.5)]"
      role="status"
      aria-live="polite"
    >
      <p className="font-semibold text-amber-100/95">You&apos;re now a Premium member</p>
      <p className="mt-1 text-muted">
        Thank you for supporting Deep Well Audio. Bookmarks, notes, topic packs, and advanced filters are on your account—refresh if
        something doesn&apos;t appear right away.
      </p>
    </div>
  );
}
