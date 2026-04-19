"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";
import type { BibleBookDef } from "@/lib/study/bible-books";
import { getNewTestamentBooks, getOldTestamentBooks } from "@/lib/bible/testament";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (book: BibleBookDef) => void;
  currentBookId: string;
};

export function BibleBookPicker({ open, onClose, onSelect, currentBookId }: Props) {
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

  const ot = getOldTestamentBooks();
  const nt = getNewTestamentBooks();

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close" onClick={onClose} />
      <div className="relative flex max-h-[min(92vh,720px)] w-full max-w-2xl flex-col rounded-t-3xl border border-stone-700 bg-[#0e1118] shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-stone-700 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-stone-100">
            Choose a book
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 transition hover:bg-stone-800 hover:text-stone-100"
            aria-label="Close book list"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <BookGridSection label="Old Testament" books={ot} currentBookId={currentBookId} onSelect={onSelect} onPicked={onClose} />
          <BookGridSection
            label="New Testament"
            books={nt}
            currentBookId={currentBookId}
            onSelect={onSelect}
            onPicked={onClose}
            className="mt-10"
          />
        </div>
      </div>
    </div>
  );
}

function BookGridSection({
  label,
  books,
  currentBookId,
  onSelect,
  onPicked,
  className = "",
}: {
  label: string;
  books: BibleBookDef[];
  currentBookId: string;
  onSelect: (book: BibleBookDef) => void;
  onPicked: () => void;
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">{label}</h3>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {books.map((b) => {
          const active = b.apiBookId === currentBookId;
          return (
            <li key={b.apiBookId}>
              <button
                type="button"
                onClick={() => {
                  onSelect(b);
                  onPicked();
                }}
                className={[
                  "flex min-h-[48px] w-full items-center rounded-xl border px-3 py-2.5 text-left text-sm transition",
                  active
                    ? "border-amber-500/50 bg-amber-500/15 font-semibold text-amber-50"
                    : "border-stone-600 bg-stone-900 text-stone-100 hover:border-stone-500 hover:bg-stone-800",
                ].join(" ")}
              >
                {b.label}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
