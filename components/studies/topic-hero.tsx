import Link from "next/link";
import type { Route } from "next";
import { STUDY_CATEGORY_LABELS } from "@/lib/study";
import type { StudyTopic } from "@/lib/study/types";
import { STUDIES_HUB_CATEGORY_LABELS } from "@/lib/studies/hub-categories";
import { hubCategoriesForTopicSlug } from "@/lib/studies/topic-categories";

type Props = {
  topic: StudyTopic;
  /** Platform category route helper */
  categoryHref: (slug: string) => string;
};

export function TopicHero({ topic, categoryHref }: Props) {
  const hubCats = hubCategoriesForTopicSlug(topic.slug);

  return (
    <header className="max-w-3xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-amber-200/75">{STUDY_CATEGORY_LABELS[topic.category]}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-[2rem]">{topic.title}</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-200/95">{topic.shortDescription}</p>
      {hubCats.length > 0 ? (
        <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
          <span className="font-medium text-slate-400">Browse: </span>
          {hubCats.map((cat, i) => (
            <span key={cat}>
              {i > 0 ? " · " : null}
              <Link href={categoryHref(cat) as Route} className="text-amber-200/75 underline-offset-2 transition hover:text-amber-100 hover:underline">
                {STUDIES_HUB_CATEGORY_LABELS[cat]}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </header>
  );
}
