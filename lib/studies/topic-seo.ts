import type { Metadata } from "next";
import type { StudyTopic } from "@/lib/study/types";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";

/** Metadata for `/studies` hub. */
export function buildStudiesHubMetadata(): Metadata {
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const url = `${base}/studies`;
  const title = "Studies & Guided Scripture Lessons | Deep Well Audio";
  const description =
    "Browse Scripture-first study topics—emotional struggles, spiritual growth, relationships, and gospel foundations—with guided lessons and deep links into Bible reading.";
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title, description, url, siteName: "Deep Well Audio", type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * SEO for study topic pages (`/studies/topic/...` and legacy `/study/...`) — human titles, no keyword stuffing.
 * @param pathname - canonical path e.g. `/studies/topic/anxiety`
 */
export function buildStudiesTopicMetadata(topic: StudyTopic, pathname: string): Metadata {
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const url = `${base}${pathname}`;
  const title = `Bible Verses About ${topic.title} | Deep Well Audio`;
  const description = topic.seoDescription;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "Deep Well Audio",
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function studiesTopicJsonLd(topic: StudyTopic, pathname: string) {
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const url = `${base}${pathname}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Bible Verses About ${topic.title}`,
    description: topic.seoDescription,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Deep Well Audio",
      url: base,
    },
    about: {
      "@type": "Thing",
      name: topic.title,
      description: topic.shortDescription,
    },
  };
}
