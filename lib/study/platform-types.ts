/** Shared domain types for the Bible + studies platform (aligned with Supabase rows). */

export type BibleBook = {
  id: string;
  slug: string;
  name: string;
  abbreviation: string;
  testament: "old" | "new";
  order: number;
  chapterCount: number;
};

export type BibleVerse = {
  id: string;
  translationId: string;
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
  reference: string;
  text: string;
};

export type StudyCategory = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sortOrder: number;
};

export type StudyTopic = {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  summary: string;
  intro: string;
  featured: boolean;
  relatedTopicSlugs: string[];
  keyVerseReferences: string[];
  tags: string[];
  status: "draft" | "published";
};

export type StudyLessonSection = {
  title: string;
  body: string;
  relatedVerseReferences?: string[];
};

export type StudyLesson = {
  id: string;
  slug: string;
  topicId: string;
  title: string;
  summary: string;
  level: "quick" | "guided" | "deep";
  estimatedMinutes: number;
  status: "draft" | "published";
  keyVerseReferences: string[];
  sections: StudyLessonSection[];
  reflectionQuestions: string[];
  applicationSteps: string[];
  prayer?: string | null;
  relatedTopicSlugs: string[];
  sortOrder: number;
};

export type StudySeries = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  lessonSlugs: string[];
  estimatedMinutes: number;
  featured: boolean;
  status: "draft" | "published";
};
