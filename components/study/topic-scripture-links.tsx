"use client";

import { useStudy } from "@/components/study/study-provider";
import { normalizeScriptureTagInput } from "@/lib/study/refs";

type Props = {
  references: readonly string[];
  /** Optional class on the wrapping <ul> */
  className?: string;
  /** Button/chip styling variant */
  variant?: "list" | "chips";
};

/**
 * Opens references in the existing Study overlays via `openFromScriptureTag`.
 */
export function TopicScriptureLinks({ references, className, variant = "list" }: Props) {
  const study = useStudy();
  if (!references.length) return null;

  const chip =
    variant === "chips"
      ? "min-h-[44px] rounded-full border border-line/45 bg-[rgba(9,12,18,0.4)] px-3.5 py-2 text-left text-sm text-slate-200 transition hover:border-accent/28 hover:bg-white/[0.04]"
      : "flex min-h-[48px] w-full items-center rounded-xl border border-line/40 bg-[rgba(9,12,18,0.35)] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-accent/25";

  return (
    <ul className={variant === "chips" ? `flex flex-wrap gap-2 ${className ?? ""}` : `space-y-2 ${className ?? ""}`}>
      {references.map((ref) => (
        <li key={ref} className={variant === "chips" ? "" : ""}>
          <button
            type="button"
            onClick={() => study.openFromScriptureTag(normalizeScriptureTagInput(ref), { teachingKey: null })}
            className={chip}
          >
            {ref}
          </button>
        </li>
      ))}
    </ul>
  );
}
