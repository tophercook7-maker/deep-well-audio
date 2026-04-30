import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Reading column only — opaque paper surface for Scripture; `full` is a calmer secondary panel. */
  variant?: "reading" | "full";
};

/**
 * Dedicated Scripture reading surface: opaque warm paper separates text from the global
 * atmosphere so contrast stays stable for long reading sessions.
 */
export function BibleReaderShell({ children, className = "", variant = "reading" }: Props) {
  /** Opaque warm paper — minimal chrome so Scripture stays the focus. */
  const reading =
    "relative isolate z-10 w-full rounded-2xl border border-stone-300/50 bg-[#f5f2eb] text-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)]";

  const full =
    "relative isolate z-10 rounded-2xl border border-stone-300/45 bg-[#f3efe6] text-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)]";

  const inner = variant === "reading" ? reading : full;

  return <div className={`${inner} ${className}`}>{children}</div>;
}
