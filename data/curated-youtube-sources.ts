/**
 * Curated public YouTube channels — single config file to extend the library.
 *
 * Ingestion (see `lib/curated-teachings/aggregate.ts`):
 * - When `YOUTUBE_API_KEY` is set, **YouTube Data API v3** is tried first per channel (uploads playlist).
 * - Falls back to **public Atom RSS** per channel when API fails or no key (or when `rssOnly: true`).
 *
 * Tier 3 (World Watch): keep `active: false` until a channel is editorially approved; then set `isWorldWatchSource: true`
 * and `tier: 3` so video surfaces stay separate from the general library funnel.
 */
import type { CuratedCategorySlug } from "@/lib/curated-teachings/categories";

export type CuratedYoutubeSourceType = "youtube_rss" | "youtube_api";

/** Trust / editorial tier (documentation + future filters). */
export type CuratedSourceTier = 1 | 2 | 3;

export type CuratedYoutubeSource = {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string | null;
  sourceType: CuratedYoutubeSourceType;
  /** Primary category first; items inherit the full list unless overridden later. */
  categoryDefaults: CuratedCategorySlug[];
  tier: CuratedSourceTier;
  active: boolean;
  priority: number;
  isFeatured: boolean;
  /** When true, items feed the World Watch **video** pool (use sparingly; Tier 3 only in production). */
  isWorldWatchSource: boolean;
  /** When true, guests see sign-in before Watch on curated cards (members-only default). */
  membersOnlyDefault: boolean;
  notes: string | null;
  /** Optional direct RSS URL if `channelId` is unsuitable for Atom. */
  rssUrl: string | null;
  /** Force RSS even when `YOUTUBE_API_KEY` is set (rare; debugging or API quota). */
  rssOnly?: boolean;
  websiteUrl: string | null;
  thumbnailFallback: string | null;
};

export const CURATED_YOUTUBE_SOURCES: CuratedYoutubeSource[] = [
  // --- Tier 1 — foundational / safe ---
  {
    id: "bibleproject",
    title: "BibleProject",
    channelTitle: "BibleProject",
    channelId: "UCVfwlh9XpX2Y_tQfjeln9QA",
    sourceType: "youtube_rss",
    categoryDefaults: ["bible-foundations", "verse-by-verse"],
    tier: 1,
    active: true,
    priority: 10,
    isFeatured: true,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://bibleproject.com",
  },
  {
    id: "desiring-god",
    title: "Desiring God",
    channelTitle: "Desiring God",
    channelId: "UCnrFlpro0xfYjz6s5Xa8WWw",
    sourceType: "youtube_rss",
    categoryDefaults: ["christian-living", "sermons-preaching"],
    tier: 1,
    active: true,
    priority: 12,
    isFeatured: true,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://www.desiringgod.org",
  },
  {
    id: "truth-for-life",
    title: "Truth For Life",
    channelTitle: "Truth For Life · Alistair Begg",
    channelId: "UCsCyJ7xl8rQ10Cyz-fwJ5Xg",
    sourceType: "youtube_rss",
    categoryDefaults: ["sermons-preaching", "bible-foundations", "christian-living"],
    tier: 1,
    active: true,
    priority: 14,
    isFeatured: true,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://www.truthforlife.org",
  },
  {
    id: "got-questions",
    title: "Got Questions Ministries",
    channelTitle: "Got Questions Ministries",
    channelId: "UCrHADU8H0P2Q_79sAhYjlGA",
    sourceType: "youtube_rss",
    categoryDefaults: ["bible-foundations", "apologetics", "discernment"],
    tier: 1,
    active: true,
    priority: 16,
    isFeatured: true,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://www.gotquestions.org",
  },
  {
    id: "mike-winger",
    title: "Mike Winger",
    channelTitle: "Mike Winger",
    channelId: "UC7u2HaYBKDaLPcWmldxgGEA",
    sourceType: "youtube_rss",
    categoryDefaults: ["apologetics", "discernment", "verse-by-verse"],
    tier: 1,
    active: true,
    priority: 18,
    isFeatured: false,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://biblethinker.org",
  },
  // --- Tier 2 — practical / engaging ---
  {
    id: "the-beat-allen-parr",
    title: "THE BEAT by Allen Parr",
    channelTitle: "THE BEAT by Allen Parr",
    channelId: "UCm_RMW_fQk-ELpPYUzor8lw",
    sourceType: "youtube_rss",
    categoryDefaults: ["christian-living", "discernment"],
    tier: 2,
    active: true,
    priority: 30,
    isFeatured: true,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://thebeatagp.com",
  },
  {
    id: "living-waters",
    title: "Living Waters",
    channelTitle: "Living Waters",
    channelId: "UCmrVJGUS1u5-Hsm_BFS_1YA",
    sourceType: "youtube_rss",
    categoryDefaults: ["apologetics", "discernment", "christian-living"],
    tier: 2,
    active: true,
    priority: 32,
    isFeatured: false,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://livingwaters.com",
  },
  {
    id: "cross-examined",
    title: "Cross Examined",
    channelTitle: "Cross Examined",
    channelId: "UCedYGs_lqq1uNet0u7qlSyQ",
    sourceType: "youtube_rss",
    categoryDefaults: ["apologetics", "discernment"],
    tier: 2,
    active: true,
    priority: 34,
    isFeatured: false,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://crossexamined.org",
  },
  {
    id: "cold-case-christianity",
    title: "Cold-Case Christianity",
    channelTitle: "Cold-Case Christianity",
    channelId: "UCVFe7xhG6rl0ruoMQCJDtnw",
    sourceType: "youtube_rss",
    categoryDefaults: ["apologetics", "discernment"],
    tier: 2,
    active: true,
    priority: 36,
    isFeatured: false,
    isWorldWatchSource: false,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes: null,
    rssUrl: null,
    websiteUrl: "https://coldcasechristianity.com",
  },
  // --- Tier 3 — World Watch / discernment (`isWorldWatchSource: true`; activate gradually; keep `channelId` aligned with official YouTube) ---
  // Remaining candidates stay `active: false` until editorially approved.
  {
    id: "ww-tier3-albert-mohler",
    title: "Albert Mohler",
    channelTitle: "Albert Mohler",
    /** Official: https://www.youtube.com/@AlbertMohlerOfficial */
    channelId: "UCzH05TIlVgb3fNFMb10LYvg",
    sourceType: "youtube_rss",
    categoryDefaults: ["world-watch", "discernment", "christian-living"],
    tier: 3,
    active: false,
    priority: 4,
    isFeatured: false,
    isWorldWatchSource: true,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes:
      "The Briefing and related uploads—daily/worldview commentary; sober tone. Paused for Tier 3 rollout; set active:true to re-enable.",
    rssUrl: null,
    websiteUrl: "https://albertmohler.com",
  },
  {
    id: "ww-tier3-tgc",
    title: "The Gospel Coalition",
    channelTitle: "The Gospel Coalition",
    /** Official: https://www.youtube.com/@TheGospelCoalition */
    channelId: "UCQMwm-DeHyFK5VPp6KySR5Q",
    sourceType: "youtube_rss",
    categoryDefaults: ["world-watch", "discernment", "bible-foundations"],
    tier: 3,
    active: true,
    priority: 5,
    isFeatured: false,
    isWorldWatchSource: true,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes:
      "Main TGC channel—teaching, conversations, conference content. Activated for World Watch pool (verify feed periodically).",
    rssUrl: null,
    websiteUrl: "https://www.thegospelcoalition.org",
  },
  {
    id: "ww-tier3-colson-breakpoint",
    title: "Colson Center / Breakpoint",
    channelTitle: "Colson Center",
    /** Official org channel: https://www.youtube.com/user/ColsonCenter (Breakpoint + broader Colson media) */
    channelId: "UCyyiGFXJkVuSWiXIaIJ7MaQ",
    sourceType: "youtube_rss",
    categoryDefaults: ["world-watch", "discernment", "apologetics"],
    tier: 3,
    active: true,
    priority: 6,
    isFeatured: false,
    isWorldWatchSource: true,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes:
      "Colson Center official uploads (incl. Breakpoint-related video). Worldview-centered cultural analysis—measured framing. Activated for World Watch pool.",
    rssUrl: null,
    websiteUrl: "https://colsoncenter.org",
  },
  {
    id: "ww-tier3-reasonable-faith",
    title: "Reasonable Faith",
    channelTitle: "Reasonable Faith",
    channelId: null,
    sourceType: "youtube_rss",
    categoryDefaults: ["world-watch", "apologetics", "discernment"],
    tier: 3,
    active: false,
    priority: 7,
    isFeatured: false,
    isWorldWatchSource: true,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes:
      "POST-APPROVAL: Official Reasonable Faith channel (primary uploads). Philosophy-forward responses—helps discernment without sensational headlines.",
    rssUrl: null,
    websiteUrl: "https://www.reasonablefaith.org",
  },
  {
    id: "ww-tier3-stand-to-reason",
    title: "Stand to Reason",
    channelTitle: "Stand to Reason",
    channelId: null,
    sourceType: "youtube_rss",
    categoryDefaults: ["world-watch", "apologetics", "discernment"],
    tier: 3,
    active: false,
    priority: 8,
    isFeatured: false,
    isWorldWatchSource: true,
    membersOnlyDefault: false,
    thumbnailFallback: null,
    notes:
      "POST-APPROVAL: Official STR channel. Tactical, calm cultural apologetics—clarity over heat, trains listeners to think in categories.",
    rssUrl: null,
    websiteUrl: "https://www.str.org",
  },
];

export function resolveCuratedYoutubeRssUrl(source: CuratedYoutubeSource): string | null {
  const direct = source.rssUrl?.trim();
  if (direct) return direct;
  const cid = source.channelId?.trim();
  if (!cid) return null;
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(cid)}`;
}

export function getActiveCuratedYoutubeSourcesSorted(): CuratedYoutubeSource[] {
  return [...CURATED_YOUTUBE_SOURCES].filter((s) => s.active !== false).sort((a, b) => a.priority - b.priority);
}

export function getCuratedYoutubeSourceById(id: string): CuratedYoutubeSource | undefined {
  return CURATED_YOUTUBE_SOURCES.find((s) => s.id === id);
}

export function getWorldWatchYoutubeSources(): CuratedYoutubeSource[] {
  return getActiveCuratedYoutubeSourcesSorted().filter((s) => s.isWorldWatchSource);
}
