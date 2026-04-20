import Link from "next/link";
import type { Route } from "next";
import { StudySupportingTeachings } from "@/components/study/study-supporting-teachings";
import { TopicHero } from "@/components/studies/topic-hero";
import { TopicKeyScriptures } from "@/components/studies/topic-key-scriptures";
import { TopicQuickHelp } from "@/components/studies/topic-quick-help";
import { TopicRelatedChapters } from "@/components/studies/topic-related-chapters";
import { TopicRelatedTopics } from "@/components/studies/topic-related-topics";
import { getLessonsForTopic, getStudyTopic } from "@/lib/study";
import { TopicBridgeSection } from "@/components/studies/topic-bridge-section";
import { TopicGuidanceStrip } from "@/components/guidance/topic-guidance-strip";
import { getCuratedRelatedTopicSlugs, getTopicQuickHelp } from "@/lib/studies/topic-engine";
import { groundTruthBridgeSlugs, walkLifeBridgeSlugs } from "@/lib/studies/topic-bridge";
import type { StudyTopic } from "@/lib/study/types";
import type { StudyRouteHelpers } from "@/lib/studies/study-routes";

type Props = {
  topic: StudyTopic;
  routes: StudyRouteHelpers;
};

export function StudyTopicBody({ topic, routes }: Props) {
  const lessons = getLessonsForTopic(topic);
  const engineQuickHelp = getTopicQuickHelp(topic.slug);
  const relatedNext = getCuratedRelatedTopicSlugs(topic);
  const nextSlug = relatedNext[0];
  const nextTitle = nextSlug ? getStudyTopic(nextSlug)?.title : null;

  return (
    <>
      <article className="max-w-3xl">
        <TopicHero topic={topic} categoryHref={routes.category} />

        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300/95">
          {topic.intro.split("\n\n").map((block, i) => (
            <p key={i}>{block}</p>
          ))}
        </div>

        {engineQuickHelp ? (
          <div className="mt-8">
            <TopicQuickHelp topicSlug={topic.slug} routes={routes} />
          </div>
        ) : (
          <section className="mt-8 rounded-2xl border border-line/50 bg-soft/10 px-5 py-4 sm:px-6" aria-labelledby="study-quick-help-fallback">
            <h2 id="study-quick-help-fallback" className="text-sm font-semibold text-white">
              Quick help
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Short audio and search—alongside Scripture—for this theme.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/topics/${topic.slug}` as Route}
                className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35"
              >
                Topic audio hub
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
        )}

        <div className="mt-10">
          <TopicKeyScriptures topic={topic} />
        </div>

        {groundTruthBridgeSlugs(topic.slug) ? (
          <TopicBridgeSection
            title="Ground this in truth"
            description="When feelings run high, Scripture keeps offering something steadier than your inner weather."
            topicSlugs={groundTruthBridgeSlugs(topic.slug)!}
            routes={routes}
          />
        ) : null}

        {walkLifeBridgeSlugs(topic.slug) ? (
          <TopicBridgeSection
            title="Walk this out"
            description="Truth is not only for the mind—it meets you where life is concrete and close."
            topicSlugs={walkLifeBridgeSlugs(topic.slug)!}
            routes={routes}
          />
        ) : null}

        <TopicRelatedChapters topicSlug={topic.slug} />

        <TopicGuidanceStrip topicSlug={topic.slug} className="mt-10" />

        <section className="mt-10" aria-labelledby="study-big-idea">
          <h2 id="study-big-idea" className="text-xl font-semibold text-white">
            Big idea
          </h2>
          <div className="mt-4 rounded-2xl border border-accent/25 bg-accent/[0.06] px-5 py-5 sm:px-6">
            <p className="text-base leading-relaxed text-slate-200/95">{topic.bigIdea}</p>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="study-context">
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

        <div className="mt-12 border-t border-line/45 pt-10">
          <TopicRelatedTopics topic={topic} routes={routes} />
        </div>

        {lessons.length > 0 ? (
          <section className="mt-12 border-t border-line/45 pt-10" aria-labelledby="study-lessons-list">
            <h2 id="study-lessons-list" className="text-xl font-semibold text-white">
              Guided lessons
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
        ) : null}

        <section className="mt-12 rounded-2xl border border-line/50 bg-soft/10 px-5 py-5 sm:px-6" aria-labelledby="topic-bible-cta">
          <h2 id="topic-bible-cta" className="text-lg font-semibold text-white">
            Stay in Scripture
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Read or listen whenever you want a steady place to return.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/bible"
              className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35"
            >
              Open Bible
            </Link>
            <Link
              href={"/bible/listen" as Route}
              className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35"
            >
              Listen
            </Link>
            {nextSlug && nextTitle ? (
              <Link
                href={routes.topic(nextSlug) as Route}
                className="inline-flex rounded-full border border-line/75 bg-soft/25 px-4 py-2 text-sm text-amber-100/90 transition hover:border-accent/35"
              >
                Related: {nextTitle}
              </Link>
            ) : null}
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
