import { PremiumUpgradeActions } from "@/components/premium/premium-upgrade-actions";
import { Bookmark, NotebookPen } from "lucide-react";

export function BookmarksNotesLockedPreview() {
  return (
    <section
      className="mt-10 border-t border-line/50 pt-8"
      aria-labelledby="study-locked-heading"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/70">Premium study</p>
      <h2 id="study-locked-heading" className="mt-2 text-xl font-semibold text-white">
        Bookmarks &amp; private notes
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Save key moments and private notes tied to each message. Return to the exact timestamp later—your study layer stays with the
        episode.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-200">
        <li className="flex gap-2">
          <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
          Mark timestamps while you listen (Premium)
        </li>
        <li className="flex gap-2">
          <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
          Keep short reflections per episode—visible only to you
        </li>
      </ul>
      <PremiumUpgradeActions className="mt-6" align="start" />
    </section>
  );
}
