"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { findScriptureRefs } from "@/lib/study/refs";
import { useStudyOptional } from "@/components/study/study-provider";
import { DEFAULT_READER_QUERY } from "@/components/study/study-provider";

export function CuratedStudyLaunch({ excerpt }: { excerpt: string | null }) {
  const study = useStudyOptional();
  const first = useMemo(() => (excerpt ? findScriptureRefs(excerpt)[0] ?? null : null), [excerpt]);

  if (!study) return null;

  return (
    <button
      type="button"
      onClick={() =>
        first ? study.openReader(first, { title: first.label }) : study.openReaderQuery(DEFAULT_READER_QUERY, { title: "Psalm 1" })
      }
      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-line/60 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-accent/35 hover:text-amber-50 sm:w-auto sm:px-4"
    >
      <BookOpen className="h-3.5 w-3.5 text-amber-200/80" aria-hidden />
      Open Bible
    </button>
  );
}
