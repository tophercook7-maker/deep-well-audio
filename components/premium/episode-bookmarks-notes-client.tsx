"use client";

import { BookmarksPanel } from "@/components/premium/bookmarks-panel";
import { NotesPanel } from "@/components/premium/notes-panel";
import type { EpisodeBookmarkRow } from "@/lib/bookmarks";
import type { EpisodeNoteRow } from "@/lib/notes";

type Props = {
  episodeId: string;
  initialBookmarks: EpisodeBookmarkRow[];
  initialNotes: EpisodeNoteRow[];
};

export function EpisodeBookmarksNotesClient({ episodeId, initialBookmarks, initialNotes }: Props) {
  return (
    <section className="mt-10 border-t border-line/50 pt-8" aria-labelledby="episode-study-heading">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/70">Premium study</p>
      <h2 id="episode-study-heading" className="mt-2 text-xl font-semibold text-white">
        Bookmarks &amp; notes
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Timestamps and private notes stay with this episode. Use the player control to capture the current moment while you listen.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BookmarksPanel episodeId={episodeId} initialBookmarks={initialBookmarks} />
        <NotesPanel episodeId={episodeId} initialNotes={initialNotes} />
      </div>
    </section>
  );
}
