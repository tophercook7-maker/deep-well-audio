import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { BibleChapterClient } from "@/components/bible/bible-chapter-client";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionBackLink } from "@/components/shared/section-back-link";
import { getChapterCountForBookId } from "@/lib/bible/chapter-counts";
import { assertTranslation, bibleChapterPath, chapterApiQuery, resolveBookFromUrlSegment } from "@/lib/bible/navigation-urls";
import { fetchPassage, studyTranslationShortLabel } from "@/lib/study/bible-api";
import { getSessionUser } from "@/lib/auth";

type Props = { params: Promise<{ translation: string; book: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { translation: tr, book: ub, chapter: ch } = await params;
  const translation = assertTranslation(tr);
  const book = resolveBookFromUrlSegment(ub);
  const chapter = Number.parseInt(ch, 10);
  if (!book || !Number.isFinite(chapter)) return { title: "Bible · Deep Well Audio" };
  const label = studyTranslationShortLabel(translation);
  return {
    title: `${book.label} ${chapter} (${label})`,
    description: `Read ${book.label} chapter ${chapter} in the ${label} translation.`,
  };
}

export default async function BibleChapterPage({ params }: Props) {
  const { translation: tr, book: ubRaw, chapter: chRaw } = await params;
  const translation = assertTranslation(tr);
  const ub = decodeURIComponent(ubRaw);
  const book = resolveBookFromUrlSegment(ub);
  const chapter = Number.parseInt(chRaw, 10);
  if (!book || !Number.isFinite(chapter) || chapter < 1) notFound();
  const max = getChapterCountForBookId(book.apiBookId);
  if (chapter > max) notFound();
  const passage = await fetchPassage(chapterApiQuery(ub, chapter), translation);
  if (!passage) notFound();
  const user = await getSessionUser();
  const bookHubHref = bibleChapterPath(translation, ub, 1) as Route;

  return (
    <main className="container-shell py-10 sm:py-12">
      <div className="mb-8 space-y-3 rounded-2xl border border-stone-800/80 bg-stone-950/55 px-4 py-5 sm:px-5">
        <Breadcrumbs
          tone="bible"
          items={[
            { label: "Home", href: "/" },
            { label: "Bible", href: "/bible" },
            { label: book.label, href: bookHubHref },
            { label: `Chapter ${chapter}` },
          ]}
        />
        <SectionBackLink href="/bible" label="Back to Bible" tone="bible" />
      </div>
      <div className="max-w-6xl">
        <BibleChapterClient
          passage={passage}
          translation={translation}
          urlBook={ub}
          chapter={chapter}
          signedIn={!!user}
        />
      </div>
    </main>
  );
}
