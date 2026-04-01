import type { ReactNode } from "react";

/**
 * Shared interior frame for homepage curated blocks—subtle lift without loud color.
 */
export function CuratedSectionShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[1.75rem] border border-line/40 bg-gradient-to-b from-soft/[0.12] via-bg/40 to-bg/80",
        "shadow-[0_32px_80px_-52px_rgba(0,0,0,0.85)]",
        className,
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/12 to-transparent"
        aria-hidden
      />
      <div className="relative p-6 sm:p-8">{children}</div>
    </div>
  );
}
