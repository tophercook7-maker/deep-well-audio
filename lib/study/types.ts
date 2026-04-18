/**
 * Study-first topical Bible study system (content-driven; separate from /topics audio hubs).
 */

export type StudyCategoryId =
  | "life-struggles"
  | "spiritual-growth"
  | "identity-calling"
  | "doctrine"
  | "christian-living"
  | "discernment-worldview";

export type StudyOverviewSection = {
  title: string;
  paragraphs: string[];
};

export type StudyLessonSection = {
  title: string;
  paragraphs: string[];
};

export type StudyTopic = {
  slug: string;
  title: string;
  category: StudyCategoryId;
  seoTitle: string;
  seoDescription: string;
  shortDescription: string;
  intro: string;
  bigIdea: string;
  keyScriptureRefs: string[];
  overviewSections: StudyOverviewSection[];
  /** Related study topic slugs (`/study/[slug]`). */
  relatedTopics: string[];
  lessonSlugs: string[];
  /** Semantic tags for search + mapping to catalog audio (see resolveStudyTagsToCatalogTags). */
  relatedContentTags: string[];
};

export type StudyLesson = {
  slug: string;
  topicSlug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription: string;
  scriptureRefs: string[];
  sections: StudyLessonSection[];
  reflectionPoints: string[];
  /**
   * Related lessons: same-topic slug only, or `topic-slug/lesson-slug` for cross-topic.
   * @example `["anxiety-and-prayer", "faith/faith-in-uncertainty"]`
   */
  relatedLessonSlugs: string[];
  relatedContentTags: string[];
};

export const STUDY_CATEGORY_LABELS: Record<StudyCategoryId, string> = {
  "life-struggles": "Life struggles",
  "spiritual-growth": "Spiritual growth",
  "identity-calling": "Identity and calling",
  doctrine: "Doctrine",
  "christian-living": "Christian living",
  "discernment-worldview": "Discernment and worldview",
};

/** Browse order on `/study` and category filters. */
export const STUDY_CATEGORY_ORDER: StudyCategoryId[] = [
  "life-struggles",
  "christian-living",
  "spiritual-growth",
  "discernment-worldview",
  "identity-calling",
  "doctrine",
];
