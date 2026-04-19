import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyLessonBody } from "@/components/study/study-lesson-body";
import { getAllStudyLessonRoutes, getStudyLesson, getStudyTopic } from "@/lib/study";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";
import { parseStudiesLessonFlatSlug } from "@/lib/studies/lesson-flat-slug";
import { STUDIES_PLATFORM_ROUTES } from "@/lib/studies/study-routes";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllStudyLessonRoutes().map(({ topic, lesson }) => ({ slug: `${topic}--${lesson}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: flat } = await params;
  const parsed = parseStudiesLessonFlatSlug(flat);
  const lesson = parsed ? getStudyLesson(parsed.topicSlug, parsed.lessonSlug) : null;
  if (!lesson) return { title: "Study lesson · Deep Well Audio" };
  const title = lesson.seoTitle;
  const description = lesson.seoDescription;
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const url = `${base}/studies/lesson/${flat}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Deep Well Audio", type: "article" },
  };
}

export default async function StudiesLessonPage({ params }: Props) {
  const { slug: flat } = await params;
  const parsed = parseStudiesLessonFlatSlug(flat);
  if (!parsed) notFound();
  const lesson = getStudyLesson(parsed.topicSlug, parsed.lessonSlug);
  const topic = getStudyTopic(parsed.topicSlug);
  if (!lesson || !topic) notFound();

  return (
    <main className="container-shell py-12 sm:py-14">
      <StudyLessonBody topic={topic} lesson={lesson} routes={STUDIES_PLATFORM_ROUTES} />
    </main>
  );
}
