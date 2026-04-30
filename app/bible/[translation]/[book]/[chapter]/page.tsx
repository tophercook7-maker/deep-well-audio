import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { BibleChapterClient } from "@/components/bible/bible-chapter-client";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionBackLink } from "@/components/shared/section-back-link";
import { buildChapterMetaDescription } from "@/lib/bible/chapter-seo";
import { getChapterCountForBookId } from "@/lib/bible/chapter-counts";
import { assertTranslation, bibleChapterPath, chapterApiQuery, resolveBookFromUrlSegment } from "@/lib/bible/navigation-urls";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";
import { fetchPassage, studyTranslationShortLabel } from "@/lib/study/bible-api";
import { getSessionUser } from "@/lib/auth";

type Props = { params: Promise<{ translation: string; book: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { translation: tr, book: ub, chapter: ch } = await params;
  const translation = assertTranslation(tr);
  const book = resolveBookFromUrlSegment(ub);
  const chapter = Number.parseInt(ch, 10);
  if (!book || !Number.isFinite(chapter)) return { title: "Bible · Deep Well Audio" };
  const max = getChapterCountForBookId(book.apiBookId);
  if (chapter < 1 || chapter > max) return { title: "Bible · Deep Well Audio" };
  const label = studyTranslationShortLabel(translation);
  const passage = await fetchPassage(chapterApiQuery(ub, chapter), translation);
  if (!passage) return { title: "Bible · Deep Well Audio" };
  const description = buildChapterMetaDescription({
    bookLabel: book.label,
    chapter,
    translationLabel: label,
    verses: passage.verses ?? [],
  });
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const bookSeg = encodeURIComponent(ub.toLowerCase());
  const canonical = `${base}/bible/${translation}/${bookSeg}/${chapter}`;
  const ogTitle = `${book.label} ${chapter} (${label}) – Bible reading`;
  return {
    title: { absolute: `${ogTitle} | Deep Well Audio` },
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      type: "website",
      siteName: "Deep Well Audio",
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description,
    },
    robots: { index: true, follow: true },
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

  const label = studyTranslationShortLabel(translation);
  const description = buildChapterMetaDescription({
    bookLabel: book.label,
    chapter,
    translationLabel: label,
    verses: passage.verses ?? [],
  });
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const bookSeg = encodeURIComponent(ub.toLowerCase());
  const canonicalUrl = `${base}/bible/${translation}/${bookSeg}/${chapter}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${book.label} ${chapter}`,
    description,
    url: canonicalUrl,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: "Deep Well Audio",
      url: base,
    },
    about: {
      "@type": "Book",
      name: book.label,
      "@id": `${base}/bible/${translation}/${bookSeg}/1`,
    },
  };

  return (
    <main className="mx-auto w-full max-w-[1800px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-10 space-y-3 border-b border-stone-800/45 pb-6">
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
      <div className="w-full">
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
