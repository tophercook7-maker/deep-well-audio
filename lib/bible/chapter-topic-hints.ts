/**
 * Bible chapter ↔ topical study linking.
 * Data lives in `lib/studies/topic-registry.ts` and is indexed in `lib/studies/topic-relations.ts`.
 */

export type { ChapterTopicHint, RelatedChapterLink } from "@/lib/studies/topic-relations";
export {
  chapterTopicHintsKey,
  relatedChaptersForChapter,
  topicHintsForChapter,
} from "@/lib/studies/topic-relations";
