import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/buttons/back-button";
import { StudyTopicBody } from "@/components/study/study-topic-body";
import { getAllStudyTopics, getStudyTopic } from "@/lib/study";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";
import { STUDIES_PLATFORM_ROUTES } from "@/lib/studies/study-routes";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllStudyTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: raw } = await params;
  const topic = getStudyTopic(raw);
  if (!topic) return { title: "Studies · Deep Well Audio" };
  const title = topic.seoTitle;
  const description = topic.seoDescription;
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const url = `${base}/studies/topic/${topic.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "Deep Well Audio", type: "website" },
  };
}

export default async function StudiesTopicPage({ params }: Props) {
  const { slug: raw } = await params;
  const topic = getStudyTopic(raw);
  if (!topic) notFound();

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/studies" label="Studies" />
      </div>
      <StudyTopicBody topic={topic} routes={STUDIES_PLATFORM_ROUTES} />
    </main>
  );
}
