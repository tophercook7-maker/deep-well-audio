"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  videoId: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  footer?: React.ReactNode;
};

/**
 * Accessible in-page YouTube embed (available to all users; no plan gate here).
 */
export function CuratedYoutubeEmbedModal({ videoId, title, isOpen, onClose, footer }: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&autoplay=1`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        aria-label="Close video"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-line/60 bg-[rgba(10,12,16,0.96)] shadow-[0_28px_80px_-24px_rgba(0,0,0,0.85)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line/50 px-4 py-3 sm:px-5">
          <h2 id={titleId} className="min-w-0 flex-1 text-left text-sm font-semibold leading-snug text-white sm:text-base">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line/60 text-slate-300 transition hover:border-accent/40 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="relative aspect-video w-full bg-black">
          <iframe
            title={title}
            src={src}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        {footer ? <div className="border-t border-line/45 px-4 py-3 sm:px-5">{footer}</div> : null}
      </div>
    </div>
  );
}
