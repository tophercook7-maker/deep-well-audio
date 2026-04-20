import { STUDY_TOPICS } from "@/content/study/topics";
import { buildStudyLessonsMap } from "@/content/study/lessons";
import { STUDY_CATEGORY_LABELS, type StudyLesson, type StudyTopic } from "@/lib/study/types";
import { getTopicSearchAliases } from "@/lib/studies/topic-engine";

/** Canonical topic slugs (routes: /study/[slug]) — keep aligned with `content/study/topics.ts`. */
export const STUDY_TOPIC_SLUGS = [
  "anxiety",
  "faith",
  "purpose",
  "prayer",
  "peace",
  "fear",
  "suffering",
  "grief",
  "salvation",
  "grace",
  "identity-in-christ",
  "forgiveness",
  "discernment",
  "holiness",
  "temptation",
  "repentance",
  "assurance",
  "eternal-life",
  "wisdom",
  "work",
  "marriage",
  "parenting",
  "money",
  "suffering-and-loss",
  "obedience",
  "gospel",
  "sanctification",
  "church-history",
] as const;

export type StudyTopicSlug = (typeof STUDY_TOPIC_SLUGS)[number];

const T: Record<string, StudyTopic> = Object.fromEntries(STUDY_TOPICS.map((topic) => [topic.slug, topic]));

const L: Record<string, StudyLesson> = buildStudyLessonsMap();

/** Resolve a related-lesson link: same-topic slug, or `topic-slug/lesson-slug`. */
export function resolveStudyLessonLink(currentTopicSlug: string, link: string): StudyLesson | null {
  const raw = link.trim();
  if (!raw) return null;
  if (raw.includes("/")) {
    const parts = raw.split("/").map((s) => s.trim()).filter(Boolean);
    if (parts.length !== 2) return null;
    return getStudyLesson(parts[0]!, parts[1]!);
  }
  return getStudyLesson(currentTopicSlug, raw);
}

export function getStudyTopic(slug: string): StudyTopic | null {
  return T[slug] ?? null;
}

export function getAllStudyTopics(): StudyTopic[] {
  return STUDY_TOPIC_SLUGS.map((s) => T[s]!);
}

export function getStudyLesson(topicSlug: string, lessonSlug: string): StudyLesson | null {
  return L[`${topicSlug}/${lessonSlug}`] ?? null;
}

export function getLessonsForTopic(topic: StudyTopic): StudyLesson[] {
  return topic.lessonSlugs.map((ls) => L[`${topic.slug}/${ls}`]!).filter(Boolean);
}

export function getAllStudyLessonRoutes(): { topic: string; lesson: string }[] {
  const out: { topic: string; lesson: string }[] = [];
  for (const topic of getAllStudyTopics()) {
    for (const lessonSlug of topic.lessonSlugs) {
      out.push({ topic: topic.slug, lesson: lessonSlug });
    }
  }
  return out;
}

/** Flattened search index: topics + lessons + scripture strings + tags. */
export type StudySearchHit =
  | { kind: "topic"; topic: StudyTopic; score: number }
  | { kind: "lesson"; topic: StudyTopic; lesson: StudyLesson; score: number };

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAll(hay: string, needles: string[]): boolean {
  const h = norm(hay);
  return needles.every((n) => h.includes(n));
}

/** Add synonym terms so queries like “end times” or “identity in Christ” still match study content. */
function expandSearchQuery(raw: string): string {
  let extra = "";
  const q = raw.toLowerCase();
  if (/\b(end\s*times?|eschatolog|last\s*things|revelation)\b/i.test(q)) {
    extra += " salvation hope eternal resurrection glory promise revelation";
  }
  if (/\bidentity\s+in\s+christ\b/i.test(q) || q.includes("identity-in-christ")) {
    extra += " identity-in-christ union adoption belonging new creation";
  }
  if (/\broman?s?\s*8\b/i.test(q) || q === "rom 8") {
    extra += " romans 8 spirit flesh heirs";
  }
  return `${raw} ${extra}`;
}

/**
 * Search study catalog. Supports plain words, book names, reference-like strings (e.g. "romans 8", "phil 4"), tags, and categories.
 * Topics rank before lessons when scores tie.
 */
export function searchStudyCatalog(query: string, limit = 20): StudySearchHit[] {
  const q = norm(query);
  if (!q) return [];

  const qExpanded = norm(expandSearchQuery(query));
  const tokens = qExpanded.split(/\s+/).filter((t) => t.length > 0);
  const hits: StudySearchHit[] = [];

  const scoreText = (text: string): number => {
    const n = norm(text);
    if (n === q) return 100;
    if (n.startsWith(q)) return 80;
    if (includesAll(n, tokens)) return 60;
    let s = 0;
    for (const t of tokens) {
      if (t.length >= 2 && n.includes(t)) s += t.length >= 4 ? 15 : 8;
    }
    return s;
  };

  for (const topic of getAllStudyTopics()) {
    const blob = [
      topic.title,
      topic.slug,
      STUDY_CATEGORY_LABELS[topic.category],
      topic.shortDescription,
      topic.intro,
      topic.bigIdea,
      ...getTopicSearchAliases(topic),
      ...topic.keyScriptureRefs,
      ...topic.relatedContentTags,
      ...topic.overviewSections.flatMap((o) => [o.title, ...o.paragraphs]),
    ].join(" ");

    let sc = scoreText(blob);
    if (/^romans\s*8/i.test(q) || q.includes("rom 8")) sc = Math.max(sc, 72);
    if (/phil|philippians/i.test(q) && /4|four/i.test(q)) sc = Math.max(sc, 72);
    if (sc >= 30) hits.push({ kind: "topic", topic, score: sc });

    for (const ls of topic.lessonSlugs) {
      const lesson = L[`${topic.slug}/${ls}`];
      if (!lesson) continue;
      const lb = [
        lesson.title,
        lesson.shortDescription,
        STUDY_CATEGORY_LABELS[topic.category],
        topic.title,
        ...lesson.sections.flatMap((s) => [s.title, ...s.paragraphs]),
        ...lesson.scriptureRefs,
        ...lesson.reflectionPoints,
        ...lesson.relatedContentTags,
      ].join(" ");
      let lsScore = scoreText(lb);
      if (lsScore < 25) {
        for (const ref of lesson.scriptureRefs) {
          if (norm(ref).includes(q) || q.split(/\s+/).every((t) => norm(ref).includes(t))) lsScore = Math.max(lsScore, 50);
        }
      }
      if (lsScore >= 25) hits.push({ kind: "lesson", topic, lesson, score: lsScore });
    }
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.kind === b.kind) return 0;
    return a.kind === "topic" ? -1 : 1;
  });
  const seen = new Set<string>();
  const dedup: StudySearchHit[] = [];
  for (const h of hits) {
    const key = h.kind === "topic" ? `t:${h.topic.slug}` : `l:${h.topic.slug}/${h.lesson.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push(h);
    if (dedup.length >= limit) break;
  }
  return dedup;
}
