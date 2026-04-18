/**
 * Central entry for study catalog content and types (topics + lessons live under `content/study/`).
 * Prefer importing from `@/lib/study` for runtime helpers (search, getters).
 */

export { STUDY_TOPICS } from "@/content/study/topics";
export { buildStudyLessonsMap } from "@/content/study/lessons";
export type { StudyLesson, StudyLessonSection, StudyOverviewSection, StudyTopic } from "@/lib/study/types";
export { STUDY_CATEGORY_LABELS, STUDY_CATEGORY_ORDER } from "@/lib/study/types";
export {
  getAllStudyLessonRoutes,
  getAllStudyTopics,
  getLessonsForTopic,
  getStudyLesson,
  getStudyTopic,
  resolveStudyLessonLink,
  searchStudyCatalog,
  STUDY_TOPIC_SLUGS,
} from "@/lib/study/catalog";
