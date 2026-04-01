-- Curated YouTube library: per-user saves, notes, and lightweight progress (RLS: own rows only).
-- Used by signed-in free + premium members for study continuity; episode bookmarks remain premium-only.

-- ---------------------------------------------------------------------------
-- Saved curated videos (bookmark for later)
-- ---------------------------------------------------------------------------
create table if not exists public.curated_saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  youtube_video_id text not null,
  source_id text not null default '',
  category_slug text,
  title_snapshot text,
  created_at timestamptz not null default now(),
  constraint curated_saved_youtube_id_check check (char_length(youtube_video_id) between 11 and 11),
  constraint curated_saved_unique_user_video unique (user_id, youtube_video_id)
);

create index if not exists curated_saved_items_user_created_idx
  on public.curated_saved_items (user_id, created_at desc);

comment on table public.curated_saved_items is 'User bookmarks for curated YouTube items; private via RLS.';

-- ---------------------------------------------------------------------------
-- Notes on curated videos (one row per user per video; upsert-friendly)
-- ---------------------------------------------------------------------------
create table if not exists public.curated_video_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  youtube_video_id text not null,
  source_id text not null default '',
  title_snapshot text,
  note_content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curated_notes_youtube_id_check check (char_length(youtube_video_id) between 11 and 11),
  constraint curated_notes_unique_user_video unique (user_id, youtube_video_id)
);

create index if not exists curated_video_notes_user_updated_idx
  on public.curated_video_notes (user_id, updated_at desc);

drop trigger if exists curated_video_notes_set_updated_at on public.curated_video_notes;
create trigger curated_video_notes_set_updated_at
  before update on public.curated_video_notes
  for each row
  execute function public.set_updated_at();

comment on table public.curated_video_notes is 'Private study notes on curated YouTube videos; one per user per video.';

-- ---------------------------------------------------------------------------
-- Progress / history (opened, percent, completed)
-- ---------------------------------------------------------------------------
create table if not exists public.curated_video_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  youtube_video_id text not null,
  source_id text not null default '',
  progress_percent smallint not null default 0,
  last_watched_at timestamptz not null default now(),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curated_progress_youtube_id_check check (char_length(youtube_video_id) between 11 and 11),
  constraint curated_progress_percent_check check (progress_percent between 0 and 100),
  constraint curated_progress_unique_user_video unique (user_id, youtube_video_id)
);

create index if not exists curated_video_progress_user_last_idx
  on public.curated_video_progress (user_id, last_watched_at desc);

drop trigger if exists curated_video_progress_set_updated_at on public.curated_video_progress;
create trigger curated_video_progress_set_updated_at
  before update on public.curated_video_progress
  for each row
  execute function public.set_updated_at();

comment on table public.curated_video_progress is 'Lightweight watch state for curated YouTube items; private via RLS.';

-- ---------------------------------------------------------------------------
-- RLS policies (users only touch their own rows)
-- ---------------------------------------------------------------------------
alter table public.curated_saved_items enable row level security;
alter table public.curated_video_notes enable row level security;
alter table public.curated_video_progress enable row level security;

create policy "curated_saved_select_own"
  on public.curated_saved_items for select using (auth.uid() = user_id);
create policy "curated_saved_insert_own"
  on public.curated_saved_items for insert with check (auth.uid() = user_id);
create policy "curated_saved_delete_own"
  on public.curated_saved_items for delete using (auth.uid() = user_id);

create policy "curated_notes_select_own"
  on public.curated_video_notes for select using (auth.uid() = user_id);
create policy "curated_notes_insert_own"
  on public.curated_video_notes for insert with check (auth.uid() = user_id);
create policy "curated_notes_update_own"
  on public.curated_video_notes for update using (auth.uid() = user_id);
create policy "curated_notes_delete_own"
  on public.curated_video_notes for delete using (auth.uid() = user_id);

create policy "curated_progress_select_own"
  on public.curated_video_progress for select using (auth.uid() = user_id);
create policy "curated_progress_insert_own"
  on public.curated_video_progress for insert with check (auth.uid() = user_id);
create policy "curated_progress_update_own"
  on public.curated_video_progress for update using (auth.uid() = user_id);
create policy "curated_progress_delete_own"
  on public.curated_video_progress for delete using (auth.uid() = user_id);
