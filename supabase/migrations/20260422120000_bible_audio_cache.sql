-- Cached Bible chapter audio metadata (MP3 bytes live in Storage bucket `bible-audio`).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bible-audio',
  'bible-audio',
  false,
  52428800,
  array['audio/mpeg']::text[]
)
on conflict (id) do nothing;

create table if not exists public.bible_audio_cache (
  id uuid primary key default gen_random_uuid(),
  translation text not null,
  book_slug text not null,
  chapter_number integer not null,
  voice_slug text not null,
  storage_path text not null,
  mime_type text not null default 'audio/mpeg',
  file_size_bytes bigint,
  duration_seconds numeric,
  provider text not null default 'elevenlabs',
  provider_voice_id text not null,
  status text not null default 'ready',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bible_audio_cache_chapter_check check (chapter_number >= 1 and chapter_number <= 200),
  constraint bible_audio_cache_status_check check (status in ('generating', 'ready', 'failed')),
  constraint bible_audio_cache_translation_len check (char_length(translation) between 2 and 32),
  constraint bible_audio_cache_book_slug_len check (char_length(book_slug) between 1 and 128),
  constraint bible_audio_cache_voice_slug_len check (char_length(voice_slug) between 1 and 64),
  constraint bible_audio_cache_unique_chapter_voice unique (translation, book_slug, chapter_number, voice_slug)
);

create index if not exists bible_audio_cache_status_updated_idx
  on public.bible_audio_cache (status, updated_at desc);

comment on table public.bible_audio_cache is 'Tracks Supabase Storage paths for cached Bible chapter TTS (ElevenLabs); unique key prevents duplicate generation.';

alter table public.bible_audio_cache enable row level security;

drop trigger if exists bible_audio_cache_set_updated_at on public.bible_audio_cache;
create trigger bible_audio_cache_set_updated_at
  before update on public.bible_audio_cache
  for each row
  execute function public.set_updated_at();
