import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { GuidedPathLessonRow } from "@/components/paths/guided-path-lesson-row";
import { GuidedPathProgress } from "@/components/paths/guided-path-progress";
import {
  getAllGuidedPathSlugs,
  getGuidedPathDefinition,
  getGuidedPathDisplayTitle,
  resolveGuidedPathLessons,
} from "@/lib/guided-paths";
import { getUserPlan } from "@/lib/auth";
import { isNextDynamicUsageError } from "@/lib/next-runtime";
import { getEpisodesByTopicTag } from "@/lib/queries";
import { GuidedPathPremiumPrompt } from "@/components/paths/guided-path-premium-prompt";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllGuidedPathSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const def = getGuidedPathDefinition(typeof slug === "string" ? slug : "");
  if (!def) return { title: "Guided path · Deep Well Audio" };
  return {
    title: `${getGuidedPathDisplayTitle(def)} · Guided path · Deep Well Audio`,
    description: "Walk through this in order. Take your time.",
  };
}

export default async function GuidedPathPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = typeof raw === "string" ? raw : "";
  const def = getGuidedPathDefinition(slug);
  if (!def) notFound();

  let plan: Awaited<ReturnType<typeof getUserPlan>> = "guest";
  try {
    plan = await getUserPlan();
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
  }

  let pool = [] as Awaited<ReturnType<typeof getEpisodesByTopicTag>>["episodes"];
  let dataOk = true;
  try {
    const res = await getEpisodesByTopicTag(def.topicSlug, 120);
    pool = res.episodes;
    dataOk = res.dataOk;
  } catch (e) {
    if (isNextDynamicUsageError(e)) throw e;
    dataOk = false;
  }

  const lessons = resolveGuidedPathLessons(def, pool);
  const pageTitle = getGuidedPathDisplayTitle(def);

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-8 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Back" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500/90">Guided path</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{pageTitle}</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400/95">Walk through this in order. Take your time.</p>
        {dataOk && lessons.length > 0 ? (
          <GuidedPathProgress
            pathSlug={slug}
            totalSteps={lessons.length}
            episodeIds={lessons.map((l) => l.episode?.id ?? "")}
          />
        ) : null}
        {plan !== "premium" ? <GuidedPathPremiumPrompt /> : null}
      </header>

      {!dataOk ? (
        <p className="mt-10 text-sm text-amber-200/85">We couldn&apos;t load episodes right now. Try again soon.</p>
      ) : (
        <div className="mt-10 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-line/75 bg-soft/10">
            <div className="divide-y divide-line/55">
              {lessons.map((lesson, i) => (
                <GuidedPathLessonRow key={`${lesson.title}-${i}`} index={i + 1} title={lesson.title} episode={lesson.episode} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
