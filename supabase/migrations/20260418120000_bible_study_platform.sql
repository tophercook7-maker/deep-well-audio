-- Bible study platform: translations, books, verse cache, study catalog, user state (RLS).

-- ─── Bible text metadata (verse text may be backfilled for search; app may use bible-api.com until then)
create table if not exists public.bible_translations (
  slug text primary key,
  label text not null,
  license_note text,
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.bible_translations (slug, label, license_note, is_default, sort_order) values
  ('web', 'World English Bible (WEB)', 'Public domain; bible-api.com', true, 1),
  ('kjv', 'King James Version', 'Public domain; bible-api.com', false, 2),
  ('asv', 'American Standard Version (1901)', 'Public domain; bible-api.com', false, 3)
on conflict (slug) do nothing;

create table if not exists public.bible_books (
  slug text primary key,
  name text not null,
  api_book_id text not null unique,
  testament text not null check (testament in ('ot', 'nt')),
  sort_order int not null unique,
  chapter_count int not null check (chapter_count >= 1 and chapter_count <= 200),
  created_at timestamptz not null default now()
);

create index if not exists bible_books_testament_sort_idx on public.bible_books (testament, sort_order);

comment on table public.bible_books is 'Protestant 66-book canon; URL slug uses hyphens (1-corinthians).';

-- Optional full-text cache for on-platform search (populate via ETL later).
create table if not exists public.bible_verses (
  id bigserial primary key,
  translation_id text not null references public.bible_translations (slug) on delete cascade,
  book_slug text not null references public.bible_books (slug) on delete cascade,
  chapter int not null check (chapter >= 1 and chapter <= 200),
  verse int not null check (verse >= 1 and verse <= 200),
  text text not null,
  search_vector tsvector generated always as (to_tsvector('english', coalesce(text, ''))) stored,
  unique (translation_id, book_slug, chapter, verse)
);

create index if not exists bible_verses_lookup_idx on public.bible_verses (translation_id, book_slug, chapter);
create index if not exists bible_verses_search_idx on public.bible_verses using gin (search_vector);

comment on table public.bible_verses is 'Optional verse cache for FTS; may be empty at launch while UI uses bible-api.com.';

-- ─── Study catalog (topics/lessons also exist in repo TS; DB for queries and future CMS)
create table if not exists public.study_categories (
  slug text primary key,
  title text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.study_categories (slug, title, sort_order) values
  ('spiritual-growth', 'Spiritual Growth', 1),
  ('emotional-mental-struggles', 'Emotional and Mental Struggles', 2),
  ('relationships', 'Relationships', 3),
  ('purpose-direction', 'Purpose and Direction', 4),
  ('hard-seasons', 'Hard Seasons', 5),
  ('freedom-battle', 'Freedom and Battle', 6),
  ('gospel-foundations', 'Gospel Foundations', 7)
on conflict (slug) do nothing;

create table if not exists public.study_topics (
  slug text primary key,
  category_slug text not null references public.study_categories (slug) on delete restrict,
  title text not null,
  short_description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_topics_category_idx on public.study_topics (category_slug);

insert into public.study_topics (slug, category_slug, title, short_description) values
  ('anxiety', 'emotional-mental-struggles', 'Anxiety', 'Trust, worry, and God''s care'),
  ('fear', 'emotional-mental-struggles', 'Fear', 'Courage and faith in God'),
  ('grief', 'emotional-mental-struggles', 'Grief', 'Sorrow, loss, and hope'),
  ('prayer', 'spiritual-growth', 'Prayer', 'Talking with God'),
  ('faith', 'gospel-foundations', 'Faith', 'Believing God'),
  ('forgiveness', 'spiritual-growth', 'Forgiveness', 'Mercy and reconciliation'),
  ('healing', 'hard-seasons', 'Healing', 'Restoration in Christ'),
  ('purpose', 'purpose-direction', 'Purpose', 'Calling and direction'),
  ('identity-in-christ', 'gospel-foundations', 'Identity in Christ', 'Who you are in Jesus'),
  ('temptation', 'freedom-battle', 'Temptation', 'Resistance and holiness'),
  ('spiritual-warfare', 'freedom-battle', 'Spiritual warfare', 'Standing firm in Christ'),
  ('marriage', 'relationships', 'Marriage', 'Covenant love'),
  ('parenting', 'relationships', 'Parenting', 'Raising children in the Lord'),
  ('wisdom', 'spiritual-growth', 'Wisdom', 'Discernment and the fear of the Lord'),
  ('peace', 'spiritual-growth', 'Peace', 'Rest and trust in God')
on conflict (slug) do nothing;

create table if not exists public.study_lessons (
  id uuid primary key default gen_random_uuid(),
  topic_slug text not null references public.study_topics (slug) on delete cascade,
  slug text not null,
  title text not null,
  level text not null default 'guided' check (level in ('quick', 'guided', 'deep')),
  content jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (topic_slug, slug)
);

create index if not exists study_lessons_topic_idx on public.study_lessons (topic_slug);

create table if not exists public.study_series (
  slug text primary key,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.study_lessons is 'Structured lessons; JSONB holds sections, reflection, application, prayer when not in repo TS.';

-- ─── User study state (stable content_key / ref_key strings)
create table if not exists public.study_user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_key text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_user_notes_key_len check (char_length(content_key) between 1 and 512),
  constraint study_user_notes_body_len check (char_length(body) <= 12000),
  unique (user_id, content_key)
);

create index if not exists study_user_notes_user_updated_idx on public.study_user_notes (user_id, updated_at desc);

create table if not exists public.study_user_highlights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_key text not null,
  color text not null check (color in ('yellow', 'green', 'blue', 'pink', 'orange')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, content_key)
);

create index if not exists study_user_highlights_user_idx on public.study_user_highlights (user_id, created_at desc);

create table if not exists public.study_user_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ref_type text not null check (ref_type in ('verse', 'chapter', 'topic', 'lesson')),
  ref_key text not null,
  label text,
  created_at timestamptz not null default now(),
  unique (user_id, ref_key)
);

create index if not exists study_user_bookmarks_user_idx on public.study_user_bookmarks (user_id, created_at desc);

create table if not exists public.study_user_saved_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_key text not null,
  progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_key)
);

create table if not exists public.study_user_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('bible', 'study_topic', 'study_lesson', 'search')),
  ref_key text not null,
  opened_at timestamptz not null default now()
);

create index if not exists study_user_history_user_opened_idx on public.study_user_history (user_id, opened_at desc);
create index if not exists study_user_history_ref_idx on public.study_user_history (user_id, ref_key);

-- Triggers
drop trigger if exists study_topics_set_updated_at on public.study_topics;
create trigger study_topics_set_updated_at before update on public.study_topics for each row execute function public.set_updated_at();

drop trigger if exists study_lessons_set_updated_at on public.study_lessons;
create trigger study_lessons_set_updated_at before update on public.study_lessons for each row execute function public.set_updated_at();

drop trigger if exists study_series_set_updated_at on public.study_series;
create trigger study_series_set_updated_at before update on public.study_series for each row execute function public.set_updated_at();

drop trigger if exists study_user_notes_set_updated_at on public.study_user_notes;
create trigger study_user_notes_set_updated_at before update on public.study_user_notes for each row execute function public.set_updated_at();

drop trigger if exists study_user_highlights_set_updated_at on public.study_user_highlights;
create trigger study_user_highlights_set_updated_at before update on public.study_user_highlights for each row execute function public.set_updated_at();

drop trigger if exists study_user_saved_lessons_set_updated_at on public.study_user_saved_lessons;
create trigger study_user_saved_lessons_set_updated_at before update on public.study_user_saved_lessons for each row execute function public.set_updated_at();

-- RLS
alter table public.bible_translations enable row level security;
alter table public.bible_books enable row level security;
alter table public.bible_verses enable row level security;
alter table public.study_categories enable row level security;
alter table public.study_topics enable row level security;
alter table public.study_lessons enable row level security;
alter table public.study_series enable row level security;

create policy "bible_translations_public_read" on public.bible_translations for select using (true);
create policy "bible_books_public_read" on public.bible_books for select using (true);
create policy "bible_verses_public_read" on public.bible_verses for select using (true);
create policy "study_categories_public_read" on public.study_categories for select using (true);
create policy "study_topics_public_read" on public.study_topics for select using (true);
create policy "study_lessons_public_read" on public.study_lessons for select using (true);
create policy "study_series_public_read" on public.study_series for select using (true);

alter table public.study_user_notes enable row level security;
alter table public.study_user_highlights enable row level security;
alter table public.study_user_bookmarks enable row level security;
alter table public.study_user_saved_lessons enable row level security;
alter table public.study_user_history enable row level security;

create policy "study_user_notes_own" on public.study_user_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_user_highlights_own" on public.study_user_highlights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_user_bookmarks_own" on public.study_user_bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_user_saved_lessons_own" on public.study_user_saved_lessons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_user_history_own" on public.study_user_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
