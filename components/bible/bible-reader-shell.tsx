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
  /** Opaque warm paper — never translucent — so site atmosphere cannot wash out Scripture. */
  const reading =
    "relative isolate z-10 mx-auto w-full max-w-[47rem] rounded-2xl border border-stone-400/35 bg-[#f7f3e9] text-stone-900 shadow-[0_2px_0_rgba(255,255,255,0.75)_inset,0_16px_48px_-14px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.06)] ring-1 ring-stone-900/[0.06]";

  const full =
    "relative isolate z-10 rounded-2xl border border-stone-400/30 bg-[#f0ebe0] text-stone-900 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.2)] ring-1 ring-stone-900/[0.05]";

  const inner = variant === "reading" ? reading : full;

  return <div className={`${inner} ${className}`}>{children}</div>;
}
