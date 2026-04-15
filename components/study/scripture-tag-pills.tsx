"use client";

import { useCallback } from "react";
import { parseScriptureTagForStudy } from "@/lib/study/refs";
import { useStudyOptional } from "@/components/study/study-provider";

/** Quiet, non-interactive pill (unknown or unparseable tag). */
const pillStatic =
  "inline-flex max-w-full cursor-default items-center rounded-full border border-accent/14 bg-accent/[0.05] px-3 py-1 text-xs text-amber-200/68";

/** Subtle affordance: slightly clearer text + pointer; hover/focus lifts border only gently. */
const pillInteractive =
  "inline-flex max-w-full cursor-pointer items-center rounded-full border border-accent/26 bg-accent/[0.08] px-3 py-1 text-xs text-amber-100/88 transition hover:border-accent/38 hover:bg-accent/[0.11] hover:text-amber-50/95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(8,11,16,0.96)] active:translate-y-px";

type Props = {
  tags: string[];
  /** Max pills to show (matches previous episode row default). */
  max?: number;
  /** Passed through when opening Study (verse notes context). */
  teachingKey?: string | null;
  className?: string;
};

/**
 * Clickable scripture metadata pills (`scripture_tags`). Verse-shaped tags open the verse drawer;
 * chapter-only tags open the reader sheet. Unknown tags render as quiet, non-clickable text.
 */
export function ScriptureTagPills({ tags, max = 6, teachingKey = null, className }: Props) {
  const study = useStudyOptional();
  const slice = (tags ?? []).filter(Boolean).slice(0, max);
  if (!slice.length) return null;

  return (
    <div className={["flex flex-wrap gap-1.5", className].filter(Boolean).join(" ")}>
      {slice.map((tag, i) => (
        <ScriptureTagPill key={`${tag}-${i}`} label={tag} teachingKey={teachingKey} study={study} />
      ))}
    </div>
  );
}

function ScriptureTagPill({
  label,
  teachingKey,
  study,
}: {
  label: string;
  teachingKey: string | null;
  study: ReturnType<typeof useStudyOptional>;
}) {
  const onOpen = useCallback(() => {
    if (!study) return;
    study.openFromScriptureTag(label, { teachingKey });
  }, [label, study, teachingKey]);

  const parseable = study != null && parseScriptureTagForStudy(label) != null;

  if (!parseable) {
    return (
      <span className={pillStatic} title={label}>
        {label}
      </span>
    );
  }

  return (
    <button type="button" className={pillInteractive} title="Open in Study" onClick={onOpen}>
      {label}
    </button>
  );
}
