import Link from "next/link";
import type { Route } from "next";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionBackLink } from "@/components/shared/section-back-link";
import { StudySupportingTeachings } from "@/components/study/study-supporting-teachings";
import { resolveStudyLessonLink } from "@/lib/study";
import type { StudyLesson, StudyTopic } from "@/lib/study/types";
import type { StudyRouteHelpers } from "@/lib/studies/study-routes";

type Props = {
  topic: StudyTopic;
  lesson: StudyLesson;
  routes: StudyRouteHelpers;
};

export function StudyLessonBody({ topic, lesson, routes }: Props) {
  const topicHref = routes.topic(topic.slug) as Route;
  const studiesHref = routes.hub as Route;
  const relatedLessons = lesson.relatedLessonSlugs
    .map((slugOrRef) => resolveStudyLessonLink(topic.slug, slugOrRef))
    .filter((x): x is NonNullable<typeof x> => x != null);

  return (
    <>
      <div className="mb-6 space-y-3 border-b border-line/50 pb-5">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: routes.hubLabel, href: studiesHref },
            { label: topic.title, href: topicHref },
            { label: lesson.title },
          ]}
        />
        <div className="flex flex-wrap items-center gap-3">
          <SectionBackLink href={topicHref} label="Back to Topic" />
          <Link href={studiesHref} className="text-sm font-medium text-amber-200/80 underline-offset-2 hover:underline">
            Back to Studies
          </Link>
        </div>
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
                  <Link href={routes.lesson(rl.topicSlug, rl.slug) as Route} className="text-amber-200/85 underline-offset-2 hover:underline">
                    {rl.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>

      <div className="max-w-3xl">
        <StudySupportingTeachings
          tags={lesson.relatedContentTags.length ? lesson.relatedContentTags : topic.relatedContentTags}
          studyTopicSlug={topic.slug}
          heading="Related teaching for deeper study"
        />
      </div>
    </>
  );
}
