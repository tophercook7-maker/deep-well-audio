"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Intentional useLayoutEffect reads (matchMedia + geometry) before paint; IO fallback still in useEffect. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const FALLBACK_REVEAL_MS = 200;

const ROOT_MARGIN_BOTTOM_FRAC = 0.06;
const MIN_RATIO = 0.12;
const MIN_VISIBLE_HEIGHT_PX = 96;

function visibleEnoughByGeometry(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  if (r.height <= 0 || r.width <= 0) return false;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const rootBottom = vh * (1 - ROOT_MARGIN_BOTTOM_FRAC);
  const intersectTop = Math.max(r.top, 0);
  const intersectBottom = Math.min(r.bottom, rootBottom);
  const intersectLeft = Math.max(r.left, 0);
  const intersectRight = Math.min(r.right, vw);
  const h = Math.max(0, intersectBottom - intersectTop);
  const w = Math.max(0, intersectRight - intersectLeft);
  const areaRatio = (h * w) / (r.height * r.width);
  return areaRatio >= MIN_RATIO || h >= MIN_VISIBLE_HEIGHT_PX;
}

function entryReveals(e: IntersectionObserverEntry): boolean {
  if (!e.isIntersecting) return false;
  if (e.intersectionRatio >= MIN_RATIO) return true;
  return e.intersectionRect.height >= MIN_VISIBLE_HEIGHT_PX;
}

type Props = {
  className?: string;
  children: ReactNode;
  /** Extra delay after intersect (ms), for light staggering from parent. */
  delayMs?: number;
};

/**
 * Light scroll entrance: optional translate only — opacity is always 1 (never hidden).
 * Order: sync motion preference (layout) → geometry pre-check (layout) → IO → ~200ms fallback.
 */
export function RevealOnScroll({ className = "", children, delayMs = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [motionSettled, setMotionSettled] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = mq.matches;
    setReduceMotion(reduced);
    if (reduced) setMotionSettled(true);
    const onMq = () => {
      const r = mq.matches;
      setReduceMotion(r);
      if (r) setMotionSettled(true);
    };
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useLayoutEffect(() => {
    if (reduceMotion !== false) return;
    const el = ref.current;
    if (!el) return;
    if (visibleEnoughByGeometry(el)) {
      setMotionSettled(true);
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion === true) {
      queueMicrotask(() => setMotionSettled(true));
      return;
    }
    if (reduceMotion !== false) {
      return;
    }
    if (motionSettled) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let finished = false;
    const pendingTimeouts: number[] = [];
    let rafOuter = 0;
    let rafInner = 0;

    const scheduleReveal = () => {
      if (finished) return;
      finished = true;
      const go = () => {
        if (!cancelled) setMotionSettled(true);
      };
      if (delayMs > 0) {
        pendingTimeouts.push(window.setTimeout(go, delayMs));
      } else {
        go();
      }
    };

    if (visibleEnoughByGeometry(el)) {
      scheduleReveal();
      return () => {
        cancelled = true;
        pendingTimeouts.forEach(clearTimeout);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!entryReveals(e)) continue;
          io.disconnect();
          scheduleReveal();
          break;
        }
      },
      {
        threshold: [0, MIN_RATIO, 0.25, 0.5, 1],
        rootMargin: `0px 0px -${ROOT_MARGIN_BOTTOM_FRAC * 100}% 0px`,
      }
    );
    io.observe(el);

    const tryDrain = () => {
      if (cancelled || finished) return;
      for (const e of io.takeRecords()) {
        if (entryReveals(e)) {
          io.disconnect();
          scheduleReveal();
          return;
        }
      }
      if (visibleEnoughByGeometry(el)) {
        io.disconnect();
        scheduleReveal();
      }
    };

    rafOuter = requestAnimationFrame(() => {
      if (cancelled) return;
      tryDrain();
      rafInner = requestAnimationFrame(() => {
        if (cancelled) return;
        tryDrain();
      });
    });

    pendingTimeouts.push(
      window.setTimeout(() => {
        if (cancelled || finished) return;
        io.disconnect();
        scheduleReveal();
      }, FALLBACK_REVEAL_MS)
    );

    return () => {
      cancelled = true;
      finished = true;
      pendingTimeouts.forEach(clearTimeout);
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      io.disconnect();
    };
  }, [reduceMotion, delayMs, motionSettled]);

  const style = (() => {
    if (reduceMotion === true) return undefined;
    if (reduceMotion !== false) return undefined;
    if (!motionSettled) {
      return {
        opacity: 1,
        transform: "translateY(0.85rem)",
      } as const;
    }
    return {
      opacity: 1,
      transform: "translateY(0)",
      transition: "transform 0.72s cubic-bezier(0.22, 1, 0.36, 1)",
    } as const;
  })();

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
