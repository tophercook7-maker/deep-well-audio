import type { ReactNode } from "react";

/**
 * Quiet container for guidance — light border, no heavy “card” chrome.
 */
export function GuidedNextStepCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-2xl border border-stone-300/50 bg-[#faf7f0]/80 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-[2px] sm:px-5 sm:py-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
