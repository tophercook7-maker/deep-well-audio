"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { peekBibleHubEntryMoment, touchBibleHubVisit } from "@/lib/bible/bible-hub-moments";

/**
 * First open or return after time away — fades in quietly, no modal.
 * Records a hub visit when leaving /bible (SPA) or the tab (pagehide).
 */
export function BibleHubEntryMoment() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [phase, setPhase] = useState<"hidden" | "show" | "done">("hidden");
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const kind = peekBibleHubEntryMoment();
    if (!kind) {
      setPhase("done");
      return;
    }
    setLabel(kind === "welcome" ? "Welcome" : "Return to Scripture");
    requestAnimationFrame(() => setPhase("show"));
    const hide = window.setTimeout(() => setPhase("done"), 5200);
    return () => window.clearTimeout(hide);
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/bible")) {
        touchBibleHubVisit();
      }
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  useEffect(() => {
    const p = pathname ?? "";
    const prev = prevPath.current;
    if (prev !== null && prev.startsWith("/bible") && !p.startsWith("/bible")) {
      touchBibleHubVisit();
    }
    prevPath.current = p;
  }, [pathname]);

  if (phase === "done" || !label) return null;

  return (
    <div
      className={`mb-8 text-center transition-opacity duration-700 ease-out motion-reduce:transition-none ${
        phase === "show" ? "opacity-100" : "opacity-0"
      }`}
      aria-live="polite"
    >
      <p className="font-serif text-lg font-normal tracking-tight text-stone-300/95 sm:text-xl">{label}</p>
    </div>
  );
}
