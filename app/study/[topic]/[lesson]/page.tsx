import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { StudySupportingTeachings } from "@/components/study/study-supporting-teachings";
import { getAllStudyLessonRoutes, getStudyLesson, getStudyTopic, resolveStudyLessonLink } from "@/lib/study";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";

type Props = { params: Promise<{ topic: string; lesson: string }> };

export async function generateStaticParams() {
  return getAllStudyLessonRoutes().map(({ topic, lesson }) => ({ topic, lesson }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic: t, lesson: l } = await params;
  const lesson = getStudyLesson(t, l);
  if (!lesson) return { title: "Study lesson · Deep Well Audio" };
  const title = lesson.seoTitle;
  const description = lesson.seoDescription;
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const url = `${base}/study/${lesson.topicSlug}/${lesson.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Deep Well Audio", type: "article" },
  };
}

export default async function StudyLessonPage({ params }: Props) {
  const { topic: ts, lesson: ls } = await params;
  const lesson = getStudyLesson(ts, ls);
  const topic = getStudyTopic(ts);
  if (!lesson || !topic) notFound();

  const relatedLessons = lesson.relatedLessonSlugs
    .map((slugOrRef) => resolveStudyLessonLink(topic.slug, slugOrRef))
    .filter((x): x is NonNullable<typeof x> => x != null);

  return (
    <main className="container-shell py-12 sm:py-14">
      <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href={"/study" as Route} className="text-amber-200/80 hover:underline">
              Study
            </Link>
          </li>
          <li aria-hidden className="text-slate-600">
            /
          </li>
          <li>
            <Link href={`/study/${topic.slug}` as Route} className="text-amber-200/80 hover:underline">
              {topic.title}
            </Link>
          </li>
          <li aria-hidden className="text-slate-600">
            /
          </li>
          <li className="text-slate-400">{lesson.title}</li>
        </ol>
      </nav>

      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref={`/study/${topic.slug}` as Route} label="Topic" />
      </div>

      <article className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">{lesson.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">{lesson.shortDescription}</p>

        <section className="mt-10" aria-labelledby="lesson-scripture">
          <h2 id="lesson-scripture" className="text-xl font-semibold text-white">
            Key Scripture
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-base text-slate-300/95 marker:text-amber-200/65 sm:list-outside sm:pl-5">
            {lesson.scriptureRefs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <div className="mt-10 space-y-10">
          {lesson.sections.map((sec, si) => (
            <section key={`${lesson.slug}-s${si}`} aria-labelledby={`lesson-section-${lesson.slug}-${si}`}>
              <h2 id={`lesson-section-${lesson.slug}-${si}`} className="text-xl font-semibold text-white">
                {sec.title}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-300/95">
                {sec.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-12 border-t border-line/45 pt-10" aria-labelledby="lesson-reflection">
          <h2 id="lesson-reflection" className="text-xl font-semibold text-white">
            Reflect and respond
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-3 text-base leading-relaxed text-slate-300/95 marker:text-amber-200/65 sm:list-outside sm:pl-5">
            {lesson.reflectionPoints.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>
        </section>

        {relatedLessons.length > 0 ? (
          <section className="mt-10" aria-labelledby="lesson-related-lessons">
            <h2 id="lesson-related-lessons" className="text-lg font-semibold text-white">
              Keep studying
            </h2>
            <ul className="mt-3 space-y-2">
              {relatedLessons.map((rl) => (
                <li key={`${rl.topicSlug}/${rl.slug}`}>
                  <Link
                    href={`/study/${rl.topicSlug}/${rl.slug}` as Route}
                    className="text-amber-200/85 underline-offset-2 hover:underline"
                  >
                    {rl.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-10 text-sm text-slate-500">
          <Link href={`/study/${topic.slug}` as Route} className="font-medium text-amber-200/80 hover:underline">
            ← Back to {topic.title}
          </Link>
        </p>
      </article>

      <div className="max-w-3xl">
        <StudySupportingTeachings
          tags={lesson.relatedContentTags.length ? lesson.relatedContentTags : topic.relatedContentTags}
          studyTopicSlug={topic.slug}
          heading="Related teaching for deeper study"
        />
      </div>
    </main>
  );
}
