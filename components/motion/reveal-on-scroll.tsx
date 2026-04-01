"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
  /** Extra delay after intersect (ms), for light staggering from parent. */
  delayMs?: number;
};

/**
 * Bottom-up fade + translate on viewport entry. Inside a wrapping div. Respects `prefers-reduced-motion`.
 */
export function RevealOnScroll({ className = "", children, delayMs = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [on, setOn] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    queueMicrotask(() => setReduceMotion(mq.matches));
    const onMq = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      queueMicrotask(() => setOn(true));
      return;
    }
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (delayMs > 0) {
            window.setTimeout(() => setOn(true), delayMs);
          } else {
            setOn(true);
          }
          io.disconnect();
          break;
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduceMotion, delayMs]);

  const style = reduceMotion
    ? undefined
    : {
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(1.1rem)",
        transition: "opacity 0.72s cubic-bezier(0.22, 1, 0.36, 1), transform 0.72s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: on ? undefined : ("opacity, transform" as const),
      };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
