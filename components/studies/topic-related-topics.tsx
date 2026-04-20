import Link from "next/link";
import type { Route } from "next";
import { getStudyTopic } from "@/lib/study";
import type { StudyTopic } from "@/lib/study/types";
import { getCuratedRelatedTopicSlugs } from "@/lib/studies/topic-engine";
import type { StudyRouteHelpers } from "@/lib/studies/study-routes";

type Props = {
  topic: StudyTopic;
  routes: StudyRouteHelpers;
};

export function TopicRelatedTopics({ topic, routes }: Props) {
  const slugs = getCuratedRelatedTopicSlugs(topic).slice(0, 6);
  const resolved = slugs.map((s) => getStudyTopic(s)).filter((x): x is StudyTopic => x != null);
  if (resolved.length === 0) return null;

  return (
    <section aria-labelledby="topic-related-topics">
      <h2 id="topic-related-topics" className="text-lg font-semibold text-white">
        Related topics
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">Hand-picked next steps—explore themes that often travel together in Scripture.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {resolved.map((t) => (
          <Link
            key={t.slug}
            href={routes.topic(t.slug) as Route}
            className="rounded-full border border-line/80 px-4 py-1.5 text-sm text-amber-100/90 transition hover:border-accent/35"
          >
            {t.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
