"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ParsedPassage } from "@/lib/study/refs";
import { parsePassageFromParts, parseScriptureTagForStudy, parseVerseContentKey } from "@/lib/study/refs";
import { getBibleBookByApiId } from "@/lib/study/bible-books";
import { isStudyTranslationId } from "@/lib/study/bible-api";

export type StudyReaderState = {
  apiQuery: string;
  translation: string;
  title?: string;
  /** Full-chapter reader: intentional reading mode (polished copy in UI). */
  readingMode?: "chapter";
};

export type StudySavedVerseListRow = {
  id: string;
  book_id: string;
  book_name: string;
  chapter: number;
  verse_from: number;
  verse_to: number;
  translation_id: string;
  passage_label: string | null;
  entry_kind?: "verse" | "reader" | null;
  created_at?: string;
};

type StudyContextValue = {
  versePassage: ParsedPassage | null;
  verseTranslation: string;
  teachingContextKey: string | null;
  reader: StudyReaderState | null;
  openVerse: (p: ParsedPassage, opts?: { translation?: string; teachingKey?: string | null }) => void;
  openReader: (p: ParsedPassage, opts?: { translation?: string; title?: string }) => void;
  openReaderQuery: (
    apiQuery: string,
    opts?: { translation?: string; title?: string; readingMode?: StudyReaderState["readingMode"] }
  ) => void;
  /** Metadata pills (`scripture_tags`): verse refs → drawer; chapter-only → reader. */
  openFromScriptureTag: (tag: string, opts?: { teachingKey?: string | null; translation?: string }) => void;
  /** Reopen a row from the saved-verses list using stored shape (verse vs chapter). */
  openFromSavedVerse: (row: StudySavedVerseListRow) => void;
  /** Open the verse drawer from a stored `verse:translation:BOOK:ch:v` content key. */
  openFromVerseContentKey: (contentKey: string) => void;
  closeVerse: () => void;
  closeReader: () => void;
  closeAll: () => void;
};

const StudyContext = createContext<StudyContextValue | null>(null);

const DEFAULT_READER_QUERY = "psalms+1:1";

export function StudyProvider({ children }: { children: ReactNode }) {
  const [versePassage, setVersePassage] = useState<ParsedPassage | null>(null);
  const [verseTranslation, setVerseTranslation] = useState("web");
  const [teachingContextKey, setTeachingContextKey] = useState<string | null>(null);
  const [reader, setReader] = useState<StudyReaderState | null>(null);

  const openVerse = useCallback((p: ParsedPassage, opts?: { translation?: string; teachingKey?: string | null }) => {
    setReader(null);
    setVerseTranslation((t) => opts?.translation ?? t);
    setVersePassage(p);
    setTeachingContextKey(opts?.teachingKey ?? null);
  }, []);

  const openReader = useCallback((p: ParsedPassage, opts?: { translation?: string; title?: string }) => {
    setVersePassage(null);
    setTeachingContextKey(null);
    setReader({
      apiQuery: p.apiQuery,
      translation: opts?.translation ?? "web",
      title: opts?.title,
    });
  }, []);

  const openReaderQuery = useCallback(
    (apiQuery: string, opts?: { translation?: string; title?: string; readingMode?: StudyReaderState["readingMode"] }) => {
      setVersePassage(null);
      setTeachingContextKey(null);
      setReader({
        apiQuery: apiQuery.trim() || DEFAULT_READER_QUERY,
        translation: opts?.translation ?? "web",
        title: opts?.title,
        readingMode: opts?.readingMode,
      });
    },
    []
  );

  const closeVerse = useCallback(() => {
    setVersePassage(null);
    setTeachingContextKey(null);
  }, []);

  const closeReader = useCallback(() => setReader(null), []);

  const closeAll = useCallback(() => {
    setVersePassage(null);
    setTeachingContextKey(null);
    setReader(null);
  }, []);

  const openFromScriptureTag = useCallback(
    (tag: string, opts?: { teachingKey?: string | null; translation?: string }) => {
      const hit = parseScriptureTagForStudy(tag);
      if (!hit) return;
      const tr = opts?.translation;
      if (hit.kind === "verse") {
        openVerse(hit.passage, { teachingKey: opts?.teachingKey ?? null, translation: tr });
      } else {
        openReaderQuery(hit.apiQuery, { title: hit.title, readingMode: "chapter", translation: tr });
      }
    },
    [openVerse, openReaderQuery]
  );

  const openFromVerseContentKey = useCallback(
    (contentKey: string) => {
      const hit = parseVerseContentKey(contentKey);
      if (!hit) return;
      const translation = isStudyTranslationId(hit.translationId) ? hit.translationId : "web";
      openVerse(hit.passage, { translation, teachingKey: null });
    },
    [openVerse]
  );

  const openFromSavedVerse = useCallback(
    (row: StudySavedVerseListRow) => {
      const book = getBibleBookByApiId(row.book_id);
      if (!book) return;
      const kind = row.entry_kind === "reader" ? "reader" : "verse";
      const translation = isStudyTranslationId(row.translation_id) ? row.translation_id : "web";

      if (kind === "reader") {
        openReaderQuery(`${book.apiSlug}+${row.chapter}`, {
          title: row.passage_label?.trim() || `${row.book_name} ${row.chapter}`,
          translation,
          readingMode: "chapter",
        });
        return;
      }

      const passage = parsePassageFromParts(book, row.chapter, row.verse_from, row.verse_to);
      if (!passage) return;
      openVerse(passage, { translation, teachingKey: null });
    },
    [openReaderQuery, openVerse]
  );

  const value = useMemo(
    () => ({
      versePassage,
      verseTranslation,
      teachingContextKey,
      reader,
      openVerse,
      openReader,
      openReaderQuery,
      openFromScriptureTag,
      openFromSavedVerse,
      openFromVerseContentKey,
      closeVerse,
      closeReader,
      closeAll,
    }),
    [
      versePassage,
      verseTranslation,
      teachingContextKey,
      reader,
      openVerse,
      openReader,
      openReaderQuery,
      openFromScriptureTag,
      openFromSavedVerse,
      openFromVerseContentKey,
      closeVerse,
      closeReader,
      closeAll,
    ]
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error("useStudy must be used within StudyProvider");
  return ctx;
}

export function useStudyOptional() {
  return useContext(StudyContext);
}

export { DEFAULT_READER_QUERY };
