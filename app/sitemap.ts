import type { MetadataRoute } from "next";
import { getSafeAbsoluteSiteUrl } from "@/lib/env";
import { getAllTopicSlugs } from "@/lib/topics";
import { getAllStudyLessonRoutes, getAllStudyTopics } from "@/lib/study";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSafeAbsoluteSiteUrl().replace(/\/+$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}/bible`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/study`, lastModified: now, changeFrequency: "weekly", priority: 0.88 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${base}/world-watch`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const topicRoutes: MetadataRoute.Sitemap = getAllTopicSlugs().map((slug) => ({
    url: `${base}/topics/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const studyTopicRoutes: MetadataRoute.Sitemap = getAllStudyTopics().map((t) => ({
    url: `${base}/study/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.86,
  }));

  const studyLessonRoutes: MetadataRoute.Sitemap = getAllStudyLessonRoutes().map(({ topic, lesson }) => ({
    url: `${base}/study/${topic}/${lesson}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.82,
  }));

  return [...staticRoutes, ...topicRoutes, ...studyTopicRoutes, ...studyLessonRoutes];
}
