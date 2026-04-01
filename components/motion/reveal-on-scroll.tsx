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

    let done = false;
    let revealTimeoutId: number | undefined;
    const reveal = () => {
      if (done) return;
      done = true;
      if (delayMs > 0)
        revealTimeoutId = window.setTimeout(() => setOn(true), delayMs) as unknown as number;
      else setOn(true);
    };

    const rootMarginBottomFrac = 0.06;
    /** Fraction of the target box that must be visible for short blocks (guest preview grids). */
    const minRatio = 0.12;
    /**
     * For tall blocks (e.g. Premium World Watch full video grid), the visible strip can be far less
     * than 12% of total height while still showing a full row — without this, IO never fires and the
     * section stays opacity:0 forever.
     */
    const minVisibleHeightPx = 96;

    const entryReveals = (e: IntersectionObserverEntry) => {
      if (!e.isIntersecting) return false;
      if (e.intersectionRatio >= minRatio) return true;
      return e.intersectionRect.height >= minVisibleHeightPx;
    };

    const visibleEnoughByGeometry = () => {
      const r = el.getBoundingClientRect();
      if (r.height <= 0 || r.width <= 0) return false;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const rootBottom = vh * (1 - rootMarginBottomFrac);
      const intersectTop = Math.max(r.top, 0);
      const intersectBottom = Math.min(r.bottom, rootBottom);
      const intersectLeft = Math.max(r.left, 0);
      const intersectRight = Math.min(r.right, vw);
      const h = Math.max(0, intersectBottom - intersectTop);
      const w = Math.max(0, intersectRight - intersectLeft);
      const areaRatio = (h * w) / (r.height * r.width);
      return areaRatio >= minRatio || h >= minVisibleHeightPx;
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!entryReveals(e)) continue;
          io.disconnect();
          reveal();
          break;
        }
      },
      { threshold: [0, minRatio, 0.25, 0.5, 1], rootMargin: `0px 0px -${rootMarginBottomFrac * 100}% 0px` }
    );
    io.observe(el);

    let cancelled = false;

    const tryDrain = () => {
      if (cancelled || done) return;
      for (const e of io.takeRecords()) {
        if (entryReveals(e)) {
          io.disconnect();
          reveal();
          return;
        }
      }
      if (visibleEnoughByGeometry()) {
        io.disconnect();
        reveal();
      }
    };

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      tryDrain();
      requestAnimationFrame(() => {
        if (cancelled) return;
        tryDrain();
      });
    });

    return () => {
      cancelled = true;
      done = true;
      if (revealTimeoutId !== undefined) clearTimeout(revealTimeoutId);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
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
