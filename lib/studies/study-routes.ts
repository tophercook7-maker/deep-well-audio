/** Link builders for study UIs shared between `/study` (legacy) and `/studies` (platform routes). */
export type StudyRouteHelpers = {
  hub: string;
  hubLabel: string;
  topic: (topicSlug: string) => string;
  lesson: (topicSlug: string, lessonSlug: string) => string;
  category: (categorySlug: string) => string;
  search: (q?: string) => string;
};

export const STUDY_LEGACY_ROUTES: StudyRouteHelpers = {
  hub: "/study",
  hubLabel: "Study",
  topic: (topicSlug) => `/study/${topicSlug}`,
  lesson: (topicSlug, lessonSlug) => `/study/${topicSlug}/${lessonSlug}`,
  category: (categorySlug) => `/studies/category/${categorySlug}`,
  search: (q) => (q ? `/study?q=${encodeURIComponent(q)}` : "/study"),
};

export const STUDIES_PLATFORM_ROUTES: StudyRouteHelpers = {
  hub: "/studies",
  hubLabel: "Studies",
  topic: (topicSlug) => `/studies/topic/${topicSlug}`,
  lesson: (topicSlug, lessonSlug) => `/studies/lesson/${topicSlug}--${lessonSlug}`,
  category: (categorySlug) => `/studies/category/${categorySlug}`,
  search: (q) => (q ? `/studies/search?q=${encodeURIComponent(q)}` : "/studies/search"),
};
