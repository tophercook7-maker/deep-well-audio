/**
 * Picks the most recent “continue” signal for /bible among passage, verse note, and topic.
 * Uses only real timestamps and server note data—no invented history.
 */
import type { StudyLastPassage } from "@/lib/study/client-storage";
import type { StudyLastBibleTopic } from "@/lib/study/client-storage";
import { topicScriptureMap, type TopicKey } from "@/lib/study/topic-scripture-map";
import { normalizeScriptureTagInput, parseVerseContentKey } from "@/lib/study/refs";

type DashboardNote = { content_key: string; updated_at: string };

function parseIsoTs(iso?: string): number {
  if (!iso) return Number.NEGATIVE_INFINITY;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
}

// Continue winner priority on equal recency: passage > verse note > bible topic.
function kindRank(k: "passage" | "note" | "topic"): number {
  return k === "passage" ? 0 : k === "note" ? 1 : 2;
}

export type BibleContinueWinner =
  | { kind: "passage"; at: number; passage: StudyLastPassage }
  | { kind: "note"; at: number; contentKey: string; verseLabel: string }
  | { kind: "topic"; at: number; topicKey: TopicKey };

export function pickBiblePageContinueWinner(args: {
  lastLocal: StudyLastPassage | null;
  lastBibleTopic: StudyLastBibleTopic | null;
  recentNotes: DashboardNote[] | null;
  plan: string;
}): BibleContinueWinner | null {
  const { lastLocal, lastBibleTopic, recentNotes, plan } = args;

  const cands: BibleContinueWinner[] = [];

  if (lastLocal) {
    cands.push({
      kind: "passage",
      at: lastLocal.openedAt ?? 0,
      passage: lastLocal,
    });
  }

  if (plan === "premium" && recentNotes?.length) {
    const verseNotes = recentNotes.filter((n) => {
      if (!n.content_key.startsWith("verse:")) return false;
      return Boolean(parseVerseContentKey(n.content_key));
    });
    verseNotes.sort((a, b) => parseIsoTs(b.updated_at) - parseIsoTs(a.updated_at));
    const top = verseNotes[0];
    if (top) {
      const hit = parseVerseContentKey(top.content_key);
      if (hit) {
        cands.push({
          kind: "note",
          at: parseIsoTs(top.updated_at),
          contentKey: top.content_key,
          verseLabel: hit.passage.label,
        });
      }
    }
  }

  if (lastBibleTopic) {
    cands.push({
      kind: "topic",
      at: lastBibleTopic.at,
      topicKey: lastBibleTopic.key,
    });
  }

  if (cands.length === 0) return null;

  cands.sort((a, b) => {
    if (b.at !== a.at) return b.at - a.at;
    return kindRank(a.kind) - kindRank(b.kind);
  });

  return cands[0] ?? null;
}

export function firstVerseRefForTopic(key: TopicKey): string {
  const v = topicScriptureMap[key].verses[0];
  return normalizeScriptureTagInput(v);
}
