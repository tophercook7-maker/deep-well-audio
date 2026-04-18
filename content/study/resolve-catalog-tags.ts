import { isKnownTopicSlug, normalizeTopicSlug } from "@/lib/topics";

/**
 * Maps study semantic tags (and lesson/topic tags) to episode `topic_tags` slugs.
 * Best-effort: unknown tags pass through normalized if they match catalog slugs.
 */
const SEMANTIC_TO_CATALOG: Record<string, string[]> = {
  anxiety: ["anxiety"],
  fear: ["fear", "anxiety"],
  trust: ["trusting-god", "faith"],
  peace: ["contentment", "spiritual-growth"],
  faith: ["faith"],
  uncertainty: ["doubt", "faith"],
  "word-of-god": ["theology", "spiritual-growth"],
  obedience: ["obedience"],
  purpose: ["purpose"],
  calling: ["calling", "purpose"],
  identity: ["identity"],
  faithfulness: ["obedience", "spiritual-growth"],
  work: ["work"],
  prayer: ["prayer"],
  dependence: ["trusting-god", "prayer"],
  worship: ["worship"],
  scripture: ["theology", "spiritual-growth"],
  suffering: ["suffering"],
  trials: ["trials", "suffering"],
  endurance: ["perseverance", "suffering"],
  hope: ["eternal-life", "spiritual-growth"],
  grief: ["suffering-and-loss", "suffering"],
  salvation: ["salvation"],
  gospel: ["gospel"],
  grace: ["grace"],
  christ: ["gospel", "salvation"],
  mercy: ["grace", "forgiveness"],
  growth: ["sanctification", "spiritual-growth"],
  weakness: ["suffering", "spiritual-growth"],
  "identity-in-christ": ["identity", "theology"],
  assurance: ["assurance"],
  belonging: ["identity", "spiritual-growth"],
  security: ["assurance", "faith"],
  shame: ["identity", "suffering"],
  sanctification: ["sanctification"],
  adoption: ["theology", "salvation"],
  forgiveness: ["forgiveness"],
  reconciliation: ["forgiveness", "marriage", "love"],
  relationships: ["love", "marriage", "forgiveness-in-life"],
  discernment: ["spiritual-growth", "theology"],
  "false-teaching": ["theology", "spiritual-growth"],
  holiness: ["sanctification", "spiritual-growth"],
  purity: ["sanctification"],
  repentance: ["repentance", "spiritual-growth"],
  humility: ["spiritual-growth", "prayer"],
  return: ["repentance", "faith"],
  "eternal-life": ["eternal-life", "salvation"],
  resurrection: ["eternal-life", "salvation"],
  heaven: ["eternal-life"],
  glory: ["eternal-life", "worship"],
  wisdom: ["wisdom", "spiritual-growth"],
  proverbs: ["wisdom", "spiritual-growth"],
  "fear-of-the-lord": ["wisdom", "spiritual-growth"],
  judgment: ["theology", "spiritual-growth"],
  maturity: ["spiritual-growth", "sanctification"],
  bitterness: ["forgiveness", "suffering"],
  condemnation: ["assurance", "salvation"],
  confidence: ["assurance", "faith"],
  perspective: ["purpose", "spiritual-growth"],
  vocation: ["work", "calling"],
  diligence: ["work", "obedience"],
  stewardship: ["work", "money"],
  service: ["work", "calling"],
  teaching: ["theology", "spiritual-growth"],
  decisions: ["spiritual-growth", "purpose"],
  habits: ["spiritual-growth", "sanctification"],
  confession: ["repentance", "prayer"],
  sorrow: ["suffering", "repentance"],
  marriage: ["marriage", "love"],
  covenant: ["marriage", "theology"],
  commitment: ["obedience", "faith"],
  parenting: ["parenting", "marriage"],
  children: ["parenting", "marriage"],
  family: ["marriage", "parenting"],
  "nearness-of-god": ["prayer", "trusting-god"],
  "new-life": ["salvation", "gospel"],
  redemption: ["salvation", "gospel"],
  christlikeness: ["sanctification", "spiritual-growth"],
  "daily-life": ["spiritual-growth", "obedience"],
  "church-history": ["church-history", "theology"],
  priorities: ["purpose", "spiritual-growth"],
  greed: ["money", "contentment"],
  loss: ["suffering-and-loss", "suffering"],
  "love-for-god": ["love", "obedience"],
};

export function resolveStudyTagsToCatalogTags(rawTags: string[]): string[] {
  const out: string[] = [];
  for (const raw of rawTags) {
    const key = normalizeTopicSlug(raw);
    if (!key) continue;
    if (isKnownTopicSlug(key)) {
      out.push(key);
      continue;
    }
    const mapped = SEMANTIC_TO_CATALOG[key];
    if (mapped?.length) {
      out.push(...mapped);
    } else {
      out.push(key);
    }
  }
  return [...new Set(out.map((s) => normalizeTopicSlug(s)).filter(Boolean))];
}
