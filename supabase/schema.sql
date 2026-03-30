-- Deep Well Audio — run this in the Supabase SQL Editor (new project).
-- Adjust nothing unless you know you need it.
--
-- If CREATE TRIGGER fails on "execute function", try replacing with:
--   EXECUTE PROCEDURE public.set_updated_at();
--   EXECUTE PROCEDURE public.handle_new_user();
-- (PostgreSQL treats FUNCTION and PROCEDURE the same for triggers in supported versions.)

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  stripe_customer_id text,
  subscription_status text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- premium_waitlist (interest signups; server API + service role only)
-- ---------------------------------------------------------------------------
create table public.premium_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default now()
);

create unique index premium_waitlist_email_lower_key on public.premium_waitlist (lower(email));

-- ---------------------------------------------------------------------------
-- world_watch_digest_sends (weekly email idempotency; service role / cron only)
-- ---------------------------------------------------------------------------
create table public.world_watch_digest_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_key text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  provider_message_id text,
  created_at timestamptz not null default now(),
  unique (campaign_key, user_id)
);

create index world_watch_digest_sends_campaign_idx on public.world_watch_digest_sends (campaign_key);

-- ---------------------------------------------------------------------------
-- site_feedback (user reports; service role API only)
-- ---------------------------------------------------------------------------
create table public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  category text not null,
  message text not null,
  page_url text,
  user_agent text,
  status text not null default 'new',
  admin_note text,
  replied_at timestamptz,
  reply_sent boolean not null default false,
  constraint site_feedback_category_check check (category in ('bug', 'suggestion', 'billing', 'content', 'other')),
  constraint site_feedback_status_check check (status in ('new', 'in_progress', 'fixed', 'closed'))
);

create index site_feedback_created_at_desc_idx on public.site_feedback (created_at desc);

create trigger site_feedback_set_updated_at
  before update on public.site_feedback
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- world_watch_items (Premium feed; service role from app only)
-- ---------------------------------------------------------------------------
create table public.world_watch_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  title text not null,
  slug text not null unique,
  source_name text,
  source_url text,
  image_url text,
  external_image_url text,
  summary text not null,
  reflection text,
  category text,
  is_published boolean not null default true,
  source_type text not null default 'manual',
  source_feed text,
  source_guid text,
  canonical_url text,
  pinned boolean not null default false,
  pinned_rank integer,
  ingestion_status text not null default 'ready',
  constraint world_watch_items_category_check check (
    category is null
    or category in ('global', 'faith_public_life', 'culture', 'prayer_watch', 'other')
  ),
  constraint world_watch_items_source_type_check check (source_type in ('manual', 'rss')),
  constraint world_watch_items_ingestion_status_check check (ingestion_status in ('review', 'ready'))
);

create index world_watch_items_published_at_desc_idx on public.world_watch_items (published_at desc);
create index world_watch_items_is_published_idx on public.world_watch_items (is_published) where is_published = true;
create unique index world_watch_items_feed_guid_unique on public.world_watch_items (source_feed, source_guid)
  where source_feed is not null and source_guid is not null;
create unique index world_watch_items_canonical_url_unique on public.world_watch_items (canonical_url)
  where canonical_url is not null;
create index world_watch_items_created_at_desc_idx on public.world_watch_items (created_at desc);
create index world_watch_items_review_queue_idx on public.world_watch_items (ingestion_status, created_at desc)
  where ingestion_status = 'review';

create trigger world_watch_items_set_updated_at
  before update on public.world_watch_items
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- shows
-- ---------------------------------------------------------------------------
create table public.shows (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  host text not null,
  summary text not null default '',
  description text,
  artwork_url text,
  source_type text not null,
  official_url text,
  rss_url text,
  youtube_channel_id text,
  apple_url text,
  spotify_url text,
  category text not null,
  tags text[] not null default '{}',
  meaty_score integer not null default 0,
  featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shows_category_idx on public.shows (category);
create index shows_featured_idx on public.shows (featured) where is_active = true;
create index shows_source_type_idx on public.shows (source_type);

-- ---------------------------------------------------------------------------
-- episodes
-- ---------------------------------------------------------------------------
create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows (id) on delete cascade,
  external_id text,
  title text not null,
  slug text not null,
  description text,
  published_at timestamptz,
  duration_seconds integer,
  audio_url text,
  video_url text,
  episode_url text,
  source_type text not null,
  scripture_tags text[] not null default '{}',
  topic_tags text[] not null default '{}',
  meaty_score integer not null default 0,
  artwork_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (show_id, slug)
);

create unique index episodes_show_external_id_key on public.episodes (show_id, external_id)
  where external_id is not null;

create index episodes_show_id_idx on public.episodes (show_id);
create index episodes_published_at_idx on public.episodes (published_at desc nulls last);

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, episode_id)
);

create index favorites_user_id_idx on public.favorites (user_id);

-- ---------------------------------------------------------------------------
-- saved_shows
-- ---------------------------------------------------------------------------
create table public.saved_shows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  show_id uuid not null references public.shows (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, show_id)
);

create index saved_shows_user_id_idx on public.saved_shows (user_id);

-- ---------------------------------------------------------------------------
-- episode_bookmarks / episode_notes (Premium — per-user study data)
-- ---------------------------------------------------------------------------
create table public.episode_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  seconds integer not null,
  label text,
  created_at timestamptz not null default now()
);

create table public.episode_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index episode_bookmarks_user_episode_idx on public.episode_bookmarks (user_id, episode_id);
create index episode_notes_user_episode_idx on public.episode_notes (user_id, episode_id);

-- ---------------------------------------------------------------------------
-- source_feeds (optional DB mirror; MVP ingestion uses data/source-feeds.ts)
-- ---------------------------------------------------------------------------
create table public.source_feeds (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_type text not null,
  category text not null,
  rss_url text,
  youtube_channel_id text,
  official_url text,
  tags text[] not null default '{}',
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger shows_set_updated_at
  before update on public.shows
  for each row
  execute function public.set_updated_at();

create trigger episodes_set_updated_at
  before update on public.episodes
  for each row
  execute function public.set_updated_at();

create trigger episode_notes_set_updated_at
  before update on public.episode_notes
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'free'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.premium_waitlist enable row level security;
alter table public.world_watch_digest_sends enable row level security;
alter table public.site_feedback enable row level security;
alter table public.world_watch_items enable row level security;
alter table public.episode_bookmarks enable row level security;
alter table public.episode_notes enable row level security;
alter table public.shows enable row level security;
alter table public.episodes enable row level security;
alter table public.favorites enable row level security;
alter table public.saved_shows enable row level security;
alter table public.source_feeds enable row level security;

-- profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- shows & episodes: public read for active / nested active show
create policy "shows_select_public"
  on public.shows for select
  using (is_active = true);

create policy "episodes_select_public"
  on public.episodes for select
  using (
    exists (
      select 1 from public.shows s
      where s.id = episodes.show_id and s.is_active = true
    )
  );

-- source_feeds: no client access (ingestion uses service role)
-- favorites
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- saved_shows
create policy "saved_shows_select_own"
  on public.saved_shows for select
  using (auth.uid() = user_id);

create policy "saved_shows_insert_own"
  on public.saved_shows for insert
  with check (auth.uid() = user_id);

create policy "saved_shows_delete_own"
  on public.saved_shows for delete
  using (auth.uid() = user_id);

-- episode_bookmarks / episode_notes (Premium UI; gated in app — DB allows own rows only)
create policy "episode_bookmarks_select_own"
  on public.episode_bookmarks for select
  using (auth.uid() = user_id);

create policy "episode_bookmarks_insert_own"
  on public.episode_bookmarks for insert
  with check (auth.uid() = user_id);

create policy "episode_bookmarks_delete_own"
  on public.episode_bookmarks for delete
  using (auth.uid() = user_id);

create policy "episode_notes_select_own"
  on public.episode_notes for select
  using (auth.uid() = user_id);

create policy "episode_notes_insert_own"
  on public.episode_notes for insert
  with check (auth.uid() = user_id);

create policy "episode_notes_update_own"
  on public.episode_notes for update
  using (auth.uid() = user_id);

create policy "episode_notes_delete_own"
  on public.episode_notes for delete
  using (auth.uid() = user_id);
