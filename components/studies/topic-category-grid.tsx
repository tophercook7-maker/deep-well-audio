import Link from "next/link";
import type { Route } from "next";
import { getStudyTopic } from "@/lib/study";
import {
  STUDIES_HUB_CATEGORY_LABELS,
  STUDIES_HUB_CATEGORY_ORDER,
  STUDIES_HUB_CATEGORY_TOPICS,
} from "@/lib/studies/hub-categories";
import { STUDIES_PLATFORM_ROUTES } from "@/lib/studies/study-routes";

const r = STUDIES_PLATFORM_ROUTES;

/** Grouped category browse for the studies hub. */
export function TopicCategoryGrid() {
  return (
    <div className="mt-8 space-y-10">
      {STUDIES_HUB_CATEGORY_ORDER.map((cat) => {
        const slugs = STUDIES_HUB_CATEGORY_TOPICS[cat];
        const topics = slugs.map((s) => getStudyTopic(s)).filter((x): x is NonNullable<typeof x> => x != null);
        if (topics.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200/70">
              <Link href={r.category(cat) as Route} className="hover:underline">
                {STUDIES_HUB_CATEGORY_LABELS[cat]}
              </Link>
            </h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {topics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={r.topic(t.slug) as Route}
                    className="block h-full rounded-2xl border border-line/55 bg-[rgba(12,16,24,0.45)] px-5 py-4 transition hover:border-accent/35 hover:bg-soft/30"
                  >
                    <span className="font-semibold text-amber-50/95">{t.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-400">{t.shortDescription}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
