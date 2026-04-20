"use client";

import { useMemo } from "react";
import { resolveBookFromMatch, scriptureDetectionRegex } from "@/lib/study/bible-books";
import { parsePassageFromParts, type ParsedPassage } from "@/lib/study/refs";
import { useStudyOptional } from "@/components/study/study-provider";

type Segment = { kind: "text"; text: string } | { kind: "ref"; text: string; passage: ParsedPassage };

function buildSegments(text: string): Segment[] {
  if (!text) return [];
  const re = scriptureDetectionRegex();
  re.lastIndex = 0;
  const out: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = re.lastIndex;
    if (start > last) {
      out.push({ kind: "text", text: text.slice(last, start) });
    }
    const bookPart = m[1];
    const chapter = Number(m[2]);
    const v1 = Number(m[3]);
    const v2 = m[4] != null && m[4] !== "" ? Number(m[4]) : undefined;
    const book = resolveBookFromMatch(bookPart);
    const passage = book && Number.isFinite(chapter) && Number.isFinite(v1) ? parsePassageFromParts(book, chapter, v1, v2) : null;
    if (passage) {
      out.push({ kind: "ref", text: m[0], passage });
    } else {
      out.push({ kind: "text", text: m[0] });
    }
    last = end;
  }
  if (last < text.length) {
    out.push({ kind: "text", text: text.slice(last) });
  }
  return out;
}

export function ScriptureLinkedText({
  text,
  teachingKey,
  className,
}: {
  text: string;
  /** e.g. youtube:VIDEO_ID or episode:EPISODE_UUID for verse panel context */
  teachingKey?: string | null;
  className?: string;
}) {
  const study = useStudyOptional();
  const segments = useMemo(() => buildSegments(text), [text]);

  if (!study) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((s, i) =>
        s.kind === "text" ? (
          <span key={i}>{s.text}</span>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => study.openVerse(s.passage, { teachingKey: teachingKey ?? null })}
            className="rounded-sm font-medium text-amber-200/90 underline decoration-amber-200/35 underline-offset-2 transition hover:text-amber-50 hover:decoration-amber-100/60"
            title="Open in reader"
          >
            {s.text}
          </button>
        )
      )}
    </span>
  );
}
