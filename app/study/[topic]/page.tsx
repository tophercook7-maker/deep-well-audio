import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/buttons/back-button";
import { StudyTopicBody } from "@/components/study/study-topic-body";
import { getAllStudyTopics, getStudyTopic } from "@/lib/study";
import { buildStudiesTopicMetadata } from "@/lib/studies/topic-seo";
import { STUDY_LEGACY_ROUTES } from "@/lib/studies/study-routes";

type Props = { params: Promise<{ topic: string }> };

export async function generateStaticParams() {
  return getAllStudyTopics().map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic: raw } = await params;
  const topic = getStudyTopic(raw);
  if (!topic) return { title: "Study · Deep Well Audio" };
  return buildStudiesTopicMetadata(topic, `/study/${topic.slug}`);
}

export default async function StudyTopicPage({ params }: Props) {
  const { topic: raw } = await params;
  const topic = getStudyTopic(raw);
  if (!topic) notFound();

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/study" label="Study" />
      </div>

      <StudyTopicBody topic={topic} routes={STUDY_LEGACY_ROUTES} />
    </main>
  );
}
