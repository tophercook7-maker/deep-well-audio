"use client";

import { useMemo } from "react";
import { useStudy } from "@/components/study/study-provider";
import { TEACHING_SCRIPTURE_FALLBACK_TOPIC, topicScriptureMap } from "@/lib/study/topic-scripture-map";
import { findScriptureRefs, normalizeScriptureTagInput, parseScriptureTagForStudy } from "@/lib/study/refs";
import type { ParsedPassage } from "@/lib/study/refs";

type TagRow = { kind: "tag"; ref: string };
type PassageRow = { kind: "passage"; passage: ParsedPassage };

/**
 * “Scripture behind this teaching” — prefers `scripture_tags`, then references detected in description.
 */
export function TeachingScriptureBehind({
  scriptureTags,
  descriptionPlain,
  variant = "default",
}: {
  scriptureTags: string[];
  descriptionPlain: string;
  variant?: "default" | "compact";
}) {
  const study = useStudy();

  const rows = useMemo(() => {
    const out: (TagRow | PassageRow)[] = [];
    const seen = new Set<string>();

    for (const tag of scriptureTags) {
      const s = normalizeScriptureTagInput(tag);
      if (!s || !parseScriptureTagForStudy(s) || seen.has(s)) continue;
      seen.add(s);
      out.push({ kind: "tag", ref: s });
    }

    for (const p of findScriptureRefs(descriptionPlain)) {
      if (seen.has(p.label)) continue;
      seen.add(p.label);
      out.push({ kind: "passage", passage: p });
    }

    if (out.length === 0 && variant === "default") {
      for (const ref of topicScriptureMap[TEACHING_SCRIPTURE_FALLBACK_TOPIC]) {
        const s = normalizeScriptureTagInput(ref);
        if (!parseScriptureTagForStudy(s) || seen.has(s)) continue;
        seen.add(s);
        out.push({ kind: "tag", ref: s });
      }
    }

    return out.slice(0, 8);
  }, [descriptionPlain, scriptureTags, variant]);

  if (!rows.length) return null;

  const shell =
    variant === "compact"
      ? "mt-3 rounded-xl border border-line/40 bg-[rgba(8,11,17,0.45)] px-3 py-3"
      : "mt-8 rounded-2xl border border-line/50 bg-[rgba(9,12,18,0.38)] px-5 py-5 sm:px-6";

  const titleCls = variant === "compact" ? "text-xs font-semibold text-white" : "text-sm font-semibold text-white";
  const hintCls = variant === "compact" ? "mt-0.5 text-[11px] leading-relaxed text-muted" : "mt-1 text-xs leading-relaxed text-muted";
  const btnCls =
    variant === "compact"
      ? "rounded-full border border-line/45 bg-[rgba(8,11,17,0.5)] px-2.5 py-1 text-xs text-slate-200 transition hover:border-accent/28"
      : "rounded-full border border-line/45 bg-[rgba(8,11,17,0.5)] px-3 py-1.5 text-sm text-slate-200 transition hover:border-accent/28";

  return (
    <div className={shell}>
      <h2 className={titleCls}>Scripture behind this teaching</h2>
      <p className={hintCls}>Tap a reference to open it in Study.</p>
      <ul className={variant === "compact" ? "mt-2 flex flex-wrap gap-1.5" : "mt-4 flex flex-wrap gap-2"}>
        {rows.map((r) => (
          <li key={r.kind === "tag" ? `tag:${r.ref}` : `p:${r.passage.verseKey}`}>
            <button
              type="button"
              onClick={() =>
                r.kind === "tag"
                  ? study.openFromScriptureTag(r.ref, { teachingKey: null })
                  : study.openVerse(r.passage, { teachingKey: null })
              }
              className={btnCls}
            >
              {r.kind === "tag" ? r.ref : r.passage.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
