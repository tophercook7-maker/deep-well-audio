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
        "relative overflow-hidden rounded-[1.75rem] border border-line/35 bg-gradient-to-b from-soft/[0.08] via-[rgba(11,18,32,0.26)] to-[rgba(10,14,22,0.2)]",
        "shadow-[0_32px_80px_-52px_rgba(0,0,0,0.65)] backdrop-blur-md backdrop-saturate-125",
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
