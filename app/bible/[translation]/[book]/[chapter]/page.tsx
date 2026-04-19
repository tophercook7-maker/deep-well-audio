import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { BibleChapterClient } from "@/components/bible/bible-chapter-client";
import { BackButton } from "@/components/buttons/back-button";
import { getChapterCountForBookId } from "@/lib/bible/chapter-counts";
import { assertTranslation, chapterApiQuery, resolveBookFromUrlSegment } from "@/lib/bible/navigation-urls";
import { fetchPassage } from "@/lib/study/bible-api";
import { studyTranslationShortLabel } from "@/lib/study/bible-api";
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

  return (
    <main className="container-shell py-10 sm:py-12">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/bible" label="Bible" />
      </div>
      <header className="max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">{book.label}</p>
        <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
          Chapter {chapter}{" "}
          <span className="text-slate-500">· {studyTranslationShortLabel(translation)}</span>
        </h1>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href={"/bible/listen" as Route} className="text-amber-200/85 underline-offset-2 hover:underline">
            Listening room
          </Link>
          <Link href={"/bible/search" as Route} className="text-amber-200/85 underline-offset-2 hover:underline">
            Search
          </Link>
          <Link href={"/studies" as Route} className="text-amber-200/85 underline-offset-2 hover:underline">
            Topical studies
          </Link>
        </div>
      </header>
      <div className="mt-10 max-w-6xl">
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
