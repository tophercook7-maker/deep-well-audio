-- Editorial lifecycle for catalog episodes and World Watch items.
-- Study topics/lessons remain app-layer content (see content/study/*).

-- ---------------------------------------------------------------------------
-- episodes: library growth vs featured vs retired
-- ---------------------------------------------------------------------------
alter table public.episodes
  add column if not exists lifecycle_status text not null default 'evergreen';

alter table public.episodes
  drop constraint if exists episodes_lifecycle_status_check;
alter table public.episodes
  add constraint episodes_lifecycle_status_check
    check (lifecycle_status in ('evergreen', 'current', 'archived', 'retired'));

comment on column public.episodes.lifecycle_status is
  'evergreen = long-term library; current = timely; archived = still searchable, not primary surfaces; retired = hidden from browse/search';

alter table public.episodes
  add column if not exists featured_until timestamptz;
comment on column public.episodes.featured_until is
  'While > now(), episode is eligible for homepage/featured pools (rotates with editorial updates).';

alter table public.episodes
  add column if not exists archived_at timestamptz;
comment on column public.episodes.archived_at is
  'Optional marker when editorial archives without retiring; de-prioritized on featured surfaces.';

alter table public.episodes
  add column if not exists retired_reason text;
comment on column public.episodes.retired_reason is
  'Set when lifecycle_status = retired (broken, duplicate, off-brand, etc.).';

alter table public.episodes
  add column if not exists study_support_topic_slugs text[] not null default '{}';
comment on column public.episodes.study_support_topic_slugs is
  'Study topic slugs (e.g. anxiety, faith) for prioritizing related teaching on /study pages.';

alter table public.episodes
  add column if not exists evergreen_priority integer not null default 0;
comment on column public.episodes.evergreen_priority is
  'Higher = preferred when filling evergreen/home fallbacks after featured slots.';

create index if not exists episodes_lifecycle_status_idx on public.episodes (lifecycle_status);
create index if not exists episodes_retired_exclude_idx
  on public.episodes (published_at desc nulls last)
  where lifecycle_status is distinct from 'retired';

-- ---------------------------------------------------------------------------
-- world_watch_items: timely content ages out of teaser; library stays available
-- ---------------------------------------------------------------------------
alter table public.world_watch_items
  add column if not exists featured_until timestamptz;
comment on column public.world_watch_items.featured_until is
  'Boost for homepage/teaser while active; pair with published_at for rotation.';

alter table public.world_watch_items
  add column if not exists archived_at timestamptz;
comment on column public.world_watch_items.archived_at is
  'When set, item is excluded from homepage teaser but remains on World Watch for subscribers.';

alter table public.world_watch_items
  add column if not exists retired_at timestamptz;
comment on column public.world_watch_items.retired_at is
  'When set, item is excluded from public surfaces.';

create index if not exists world_watch_items_teaser_eligible_idx
  on public.world_watch_items (published_at desc)
  where is_published = true and archived_at is null and retired_at is null;
