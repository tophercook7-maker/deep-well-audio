"use client";

import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";
import type { CuratedCategoryMeta } from "@/lib/curated-teachings/categories";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export function HomeCategoryCuratedPreviewGrid({ cats }: { cats: CuratedCategoryMeta[] }) {
  return (
    <RevealOnScroll delayMs={30}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3.5">
        {cats.map((c) => (
          <Link
            key={c.slug}
            href={`/curated-teachings?category=${encodeURIComponent(c.slug)}` as Route}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-line/70 bg-[rgba(11,14,18,0.45)] p-4 no-underline outline-none ring-1 ring-white/[0.02] backdrop-blur-md transition duration-200 hover:border-accent/30 hover:bg-accent/[0.05] focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <div className="min-w-0">
              <p className="text-[0.9375rem] font-medium tracking-tight text-white transition group-hover:text-amber-100/95">{c.label}</p>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{c.description}</p>
            </div>
            <ChevronRight
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/55 transition group-hover:translate-x-0.5 group-hover:text-amber-200"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </RevealOnScroll>
  );
}
