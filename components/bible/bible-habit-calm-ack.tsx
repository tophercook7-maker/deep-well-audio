"use client";

import { useEffect, useState } from "react";

type Props = {
  /** When non-null, show quietly (parent should clear after a few seconds). */
  message: string | null;
  /** Softer close to a chapter: hairline + spacing, still no fanfare. */
  variant?: "default" | "chapterEnd";
  className?: string;
};

/**
 * One quiet line—no modal, no confetti, no score. Fades in softly when `message` appears.
 */
export function BibleHabitCalmAck({ message, variant = "default", className = "" }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [message]);

  if (!message) return null;

  const line = (
    <p
      role="status"
      aria-live="polite"
      className={`text-center text-sm text-stone-500 transition-opacity duration-500 ease-out motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"} ${className}`}
    >
      {message}
    </p>
  );

  if (variant !== "chapterEnd") return line;

  return (
    <div className="pt-2">
      <div className="mx-auto mb-6 h-px max-w-[11rem] bg-stone-300/70 motion-reduce:opacity-100" aria-hidden />
      {line}
    </div>
  );
}
