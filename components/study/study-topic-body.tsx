import Link from "next/link";
import type { Route } from "next";
import { StudySupportingTeachings } from "@/components/study/study-supporting-teachings";
import { STUDY_CATEGORY_LABELS, getLessonsForTopic, getStudyTopic } from "@/lib/study";
import type { StudyTopic } from "@/lib/study/types";
import type { StudyRouteHelpers } from "@/lib/studies/study-routes";

type Props = {
  topic: StudyTopic;
  routes: StudyRouteHelpers;
};

export function StudyTopicBody({ topic, routes }: Props) {
  const lessons = getLessonsForTopic(topic);

  return (
    <>
      <article className="max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">
          {STUDY_CATEGORY_LABELS[topic.category]}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">{topic.title}</h1>
        <p className="mt-3 text-base leading-relaxed text-slate-200/95">{topic.shortDescription}</p>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300/95">
          {topic.intro.split("\n\n").map((block, i) => (
            <p key={i}>{block}</p>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-line/50 bg-soft/10 px-5 py-4 sm:px-6" aria-labelledby="study-quick-help">
          <h2 id="study-quick-help" className="text-sm font-semibold text-white">
            Quick help
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Short audio takes and episode picks for this theme—alongside Scripture.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/topics/${topic.slug}` as Route}
              className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35"
            >
              Topic hub
            </Link>
            <Link
              href={routes.search() as Route}
              className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35"
            >
              Search studies
            </Link>
            <Link href="/bible" className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35">
              Open Bible reader
            </Link>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="study-big-idea">
          <h2 id="study-big-idea" className="text-xl font-semibold text-white">
            Big idea
          </h2>
          <div className="mt-4 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-5 sm:px-6">
            <p className="text-base leading-relaxed text-slate-200/95">{topic.bigIdea}</p>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="study-key-passages">
          <h2 id="study-key-passages" className="text-xl font-semibold text-white">
            Key passages
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-base leading-relaxed text-slate-300/95 marker:text-amber-200/65 sm:list-outside sm:pl-5">
            {topic.keyScriptureRefs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="study-context">
          <h2 id="study-context" className="text-xl font-semibold text-white">
            What Scripture shows
          </h2>
          <div className="mt-6 space-y-10">
            {topic.overviewSections.map((sec) => (
              <div key={sec.title} className="rounded-2xl border border-line/50 bg-soft/15 px-5 py-5 sm:px-6">
                <h3 className="text-lg font-semibold text-amber-100/90">{sec.title}</h3>
                <div className="mt-3 space-y-4 text-base leading-relaxed text-slate-300/95">
                  {sec.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-line/45 pt-10" aria-labelledby="study-lessons-list">
          <h2 id="study-lessons-list" className="text-xl font-semibold text-white">
            Study lessons
          </h2>
          <ul className="mt-5 space-y-3">
            {lessons.map((lesson) => (
              <li key={lesson.slug}>
                <Link
                  href={routes.lesson(topic.slug, lesson.slug) as Route}
                  className="block rounded-2xl border border-line/55 bg-soft/20 px-5 py-4 transition hover:border-accent/35 hover:bg-soft/35"
                >
                  <span className="font-semibold text-amber-50/95">{lesson.title}</span>
                  <span className="mt-1 block text-sm text-slate-400">{lesson.shortDescription}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="study-related-topics">
          <h2 id="study-related-topics" className="text-lg font-semibold text-white">
            Related topics
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topic.relatedTopics.map((slug) => {
              const t = getStudyTopic(slug);
              if (!t) return null;
              return (
                <Link
                  key={slug}
                  href={routes.topic(slug) as Route}
                  className="rounded-full border border-line/80 px-4 py-1.5 text-sm text-amber-100/90 transition hover:border-accent/35"
                >
                  {t.title}
                </Link>
              );
            })}
          </div>
        </section>
      </article>

      <div className="max-w-3xl">
        <StudySupportingTeachings
          tags={topic.relatedContentTags}
          studyTopicSlug={topic.slug}
          heading="Related teaching for deeper study"
        />
      </div>
    </>
  );
}
