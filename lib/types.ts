/** Database-aligned types (camelCase for app use via queries mapping or Row types). */

export type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type ShowRow = {
  id: string;
  slug: string;
  title: string;
  host: string;
  summary: string;
  description: string | null;
  artwork_url: string | null;
  source_type: string;
  official_url: string | null;
  rss_url: string | null;
  youtube_channel_id: string | null;
  apple_url: string | null;
  spotify_url: string | null;
  category: string;
  tags: string[];
  meaty_score: number;
  featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EpisodeRow = {
  id: string;
  show_id: string;
  external_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  published_at: string | null;
  duration_seconds: number | null;
  audio_url: string | null;
  video_url: string | null;
  episode_url: string | null;
  source_type: string;
  scripture_tags: string[];
  topic_tags: string[];
  meaty_score: number;
  artwork_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ShowWithMeta = ShowRow & {
  episode_count?: number;
};

export type EpisodeWithShow = EpisodeRow & {
  show?: Pick<ShowRow, "slug" | "title" | "host" | "artwork_url" | "category" | "official_url">;
};

export const CATEGORY_OPTIONS = [
  { key: "sermons", label: "Sermons" },
  { key: "bible-teaching", label: "Bible teaching" },
  { key: "apologetics", label: "Apologetics" },
  { key: "church-history", label: "Church history" },
  { key: "spiritual-growth", label: "Spiritual growth" },
] as const;

export type CategoryKey = (typeof CATEGORY_OPTIONS)[number]["key"];
