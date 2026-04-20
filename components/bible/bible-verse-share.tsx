"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BibleVerseSharePayload } from "@/lib/bible/verse-share";
import { buildBibleVerseShareUrl, buildVerseSharePlainText, formatVerseCitation } from "@/lib/bible/verse-share";

type Props = BibleVerseSharePayload & {
  compact?: boolean;
  className?: string;
};

/**
 * Quiet copy + system share for a single verse. Share builds a minimal image card (no modal).
 */
export function BibleVerseShare({
  verseText,
  bookLabel,
  chapter,
  verse,
  translation,
  urlBook,
  compact = false,
  className = "",
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  const linkUrl = useMemo(
    () => (origin ? buildBibleVerseShareUrl(origin, translation, urlBook, chapter, verse) : null),
    [origin, translation, urlBook, chapter, verse],
  );

  const plain = useMemo(
    () =>
      buildVerseSharePlainText({
        verseText,
        bookLabel,
        chapter,
        verse,
        linkUrl,
      }),
    [verseText, bookLabel, chapter, verse, linkUrl],
  );

  const cite = useMemo(() => formatVerseCitation(bookLabel, chapter, verse), [bookLabel, chapter, verse]);

  const clearCopied = useCallback(() => {
    window.setTimeout(() => setCopied(false), 2400);
  }, []);

  const runCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      clearCopied();
    } catch {
      setCopied(false);
    }
  }, [plain, clearCopied]);

  const runShare = useCallback(async () => {
    const shareUrl = linkUrl ?? "";
    const node = cardRef.current;

    if (node) {
      try {
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(node, {
          pixelRatio: 2,
          cacheBust: true,
        });
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const safeName = `${cite.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}.png`;
        const file = new File([blob], safeName, { type: "image/png" });

        if (navigator.share && typeof navigator.canShare === "function") {
          try {
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: cite,
                text: plain,
                ...(shareUrl ? { url: shareUrl } : {}),
              });
              return;
            }
          } catch {
            /* canShare / share with files not supported */
          }
        }
      } catch {
        /* image or file share unavailable — fall through */
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: cite,
          text: plain,
          ...(shareUrl ? { url: shareUrl } : {}),
        });
        return;
      } catch {
        /* cancelled */
        return;
      }
    }

    await runCopy();
  }, [cardRef, cite, linkUrl, plain, runCopy]);

  const quote = verseText.trim();
  const btnBase = compact
    ? "inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-stone-600 bg-stone-900 px-3 text-xs font-medium text-stone-100 transition hover:border-stone-500 hover:bg-stone-900/90"
    : "inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border border-stone-500/60 bg-stone-900 px-4 text-sm font-medium text-stone-100 shadow-sm transition hover:border-stone-400";

  const iconClass = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={className}>
      <div className="pointer-events-none fixed left-[-12000px] top-0 z-0" aria-hidden>
        <div ref={cardRef} className="box-border w-[340px] rounded-sm bg-[#efe9df] px-9 py-10 text-left font-serif">
          <p className="text-[1.05rem] leading-[1.68] text-[#3a342c]">
            <span className="text-[#6b6458]">“</span>
            {quote}
            <span className="text-[#6b6458]">”</span>
          </p>
          <p className="mt-7 text-[0.8125rem] tracking-[0.03em] text-[#5c554a]">— {cite}</p>
          <p className="mt-9 text-[10px] font-normal uppercase tracking-[0.32em] text-[#9a9285]">Deep Well Audio</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnBase} onClick={() => void runCopy()}>
          {copied ? <Check className={iconClass} aria-hidden /> : <Copy className={iconClass} aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" className={btnBase} onClick={() => void runShare()}>
          <Share2 className={iconClass} aria-hidden />
          Share
        </button>
      </div>
    </div>
  );
}
