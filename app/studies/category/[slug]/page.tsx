import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/buttons/back-button";
import { getStudyTopic } from "@/lib/study";
import {
  STUDIES_HUB_CATEGORY_LABELS,
  STUDIES_HUB_CATEGORY_ORDER,
  STUDIES_HUB_CATEGORY_TOPICS,
} from "@/lib/studies/hub-categories";
import { STUDIES_PLATFORM_ROUTES } from "@/lib/studies/study-routes";

const r = STUDIES_PLATFORM_ROUTES;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return STUDIES_HUB_CATEGORY_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = STUDIES_HUB_CATEGORY_LABELS[slug as keyof typeof STUDIES_HUB_CATEGORY_LABELS];
  if (!label) return { title: "Studies · Deep Well Audio" };
  return {
    title: `${label} · Studies`,
    description: `Browse Bible study topics: ${label}.`,
  };
}

export default async function StudiesCategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!STUDIES_HUB_CATEGORY_ORDER.includes(slug as (typeof STUDIES_HUB_CATEGORY_ORDER)[number])) notFound();

  const cat = slug as (typeof STUDIES_HUB_CATEGORY_ORDER)[number];
  const label = STUDIES_HUB_CATEGORY_LABELS[cat];
  const slugs = STUDIES_HUB_CATEGORY_TOPICS[cat];
  const topics = slugs.map((s) => getStudyTopic(s)).filter((x): x is NonNullable<typeof x> => x != null);

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/studies" label="Studies" />
      </div>

      <header className="max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Category</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{label}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300/95">
          Topics in this bucket are curated for browsing—open one to see lessons, key verses, and related themes.
        </p>
      </header>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
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

      <p className="mt-10 text-sm text-slate-500">
        <Link href={r.hub as Route} className="text-amber-200/85 underline-offset-2 hover:underline">
          ← All studies
        </Link>
      </p>
    </main>
  );
}
