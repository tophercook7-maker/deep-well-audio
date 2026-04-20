"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { peekHomeRitualReturnLine, touchHomeRitualVisit } from "@/lib/bible/bible-hub-moments";

/**
 * Quiet “welcome back” near Continue / Today’s Reading when returning after time away.
 */
export function HomeRitualReturnLine() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [show, setShow] = useState(false);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const line = peekHomeRitualReturnLine();
    if (line) {
      setText(line);
      requestAnimationFrame(() => setShow(true));
    }
  }, []);

  useEffect(() => {
    const p = pathname ?? "";
    const prev = prevPath.current;
    if (prev === "/" && p !== "/") {
      touchHomeRitualVisit();
    }
    prevPath.current = p;
  }, [pathname]);

  useEffect(() => {
    const onHide = () => {
      if (typeof window !== "undefined" && window.location.pathname === "/") {
        touchHomeRitualVisit();
      }
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  if (!text) return null;

  return (
    <p
      className={`mb-5 text-center text-sm leading-relaxed text-slate-500 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
        show ? "opacity-100" : "opacity-0"
      }`}
      aria-live="polite"
    >
      {text}
    </p>
  );
}
