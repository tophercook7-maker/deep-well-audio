import Link from "next/link";
import type { Route } from "next";
import { getStudyTopic } from "@/lib/study";
import type { StudyRouteHelpers } from "@/lib/studies/study-routes";

type Props = {
  title: string;
  description?: string;
  topicSlugs: string[];
  routes: StudyRouteHelpers;
};

const MAX = 3;

/**
 * Small, calm cross-links between topic clusters—never a full directory.
 */
export function TopicBridgeSection({ title, description, topicSlugs, routes }: Props) {
  const resolved = topicSlugs
    .slice(0, MAX)
    .map((s) => getStudyTopic(s))
    .filter((t): t is NonNullable<typeof t> => t != null);

  if (resolved.length === 0) return null;

  const id = `topic-bridge-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2 id={id} className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p> : null}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resolved.map((t) => (
          <li key={t.slug}>
            <Link
              href={routes.topic(t.slug) as Route}
              className="block h-full rounded-2xl border border-line/50 bg-soft/[0.12] px-4 py-3.5 transition hover:border-accent/30 hover:bg-soft/20"
            >
              <span className="block font-medium text-amber-50/95">{t.title}</span>
              <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-slate-500">{t.shortDescription}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
