"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  bookLabel: string;
  chapter: number;
  chapterCount: number;
  onSelectChapter: (n: number) => void;
};

export function BibleChapterPicker({ open, onClose, bookLabel, chapter, chapterCount, onSelectChapter }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const nums = Array.from({ length: chapterCount }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[min(85vh,520px)] w-full max-w-lg flex-col rounded-t-3xl border border-stone-700 bg-[#0e1118] shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-stone-700 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-stone-100">
            {bookLabel} — chapter
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-800 hover:text-stone-100"
            aria-label="Close chapter list"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-5 sm:px-6">
          <ol className="grid grid-cols-5 gap-2 sm:grid-cols-8">
            {nums.map((n) => {
              const active = n === chapter;
              return (
                <li key={n}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectChapter(n);
                      onClose();
                    }}
                    className={[
                      "flex h-11 w-full items-center justify-center rounded-lg border text-sm tabular-nums transition",
                      active
                        ? "border-amber-500/50 bg-amber-500/15 font-semibold text-amber-50"
                        : "border-stone-600 bg-stone-900 text-stone-100 hover:border-stone-500 hover:bg-stone-800",
                    ].join(" ")}
                  >
                    {n}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
