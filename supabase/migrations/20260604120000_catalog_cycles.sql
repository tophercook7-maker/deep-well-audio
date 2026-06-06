-- Session-safe catalog cycles: staged sync batches promote only when no blocking member sessions.

-- ---------------------------------------------------------------------------
-- catalog_cycles
-- ---------------------------------------------------------------------------
create table public.catalog_cycles (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('active', 'staged', 'superseded')),
  created_at timestamptz not null default now(),
  promoted_at timestamptz,
  last_synced_at timestamptz,
  last_cycled_at timestamptz
);

comment on table public.catalog_cycles is
  'Catalog rotation batches. active = visible default; staged = awaiting promotion; superseded = retained for pinned sessions.';

comment on column public.catalog_cycles.last_cycled_at is
  'When this batch became the active visible cycle (promoted_at alias for operators).';

create unique index catalog_cycles_one_active_idx
  on public.catalog_cycles ((1))
  where status = 'active';

create unique index catalog_cycles_one_staged_idx
  on public.catalog_cycles ((1))
  where status = 'staged';

create index catalog_cycles_status_created_idx
  on public.catalog_cycles (status, created_at desc);

-- ---------------------------------------------------------------------------
-- catalog_cycle_episodes — ordered snapshot per cycle
-- ---------------------------------------------------------------------------
create table public.catalog_cycle_episodes (
  cycle_id uuid not null references public.catalog_cycles (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  position integer not null default 0,
  primary key (cycle_id, episode_id)
);

create index catalog_cycle_episodes_cycle_position_idx
  on public.catalog_cycle_episodes (cycle_id, position);

comment on table public.catalog_cycle_episodes is
  'Episode membership + ordering for a catalog cycle snapshot (homepage/browse rotation set).';

-- ---------------------------------------------------------------------------
-- member_listening_sessions — pins signed-in listeners to a cycle
-- ---------------------------------------------------------------------------
create table public.member_listening_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cycle_id uuid not null references public.catalog_cycles (id),
  status text not null default 'active' check (status in ('active', 'finished', 'expired')),
  started_at timestamptz not null default now(),
  last_active_at timestamptz not null default now(),
  finished_at timestamptz,
  last_episode_id uuid references public.episodes (id) on delete set null
);

create unique index member_listening_sessions_one_active_per_user_idx
  on public.member_listening_sessions (user_id)
  where status = 'active';

create index member_listening_sessions_cycle_active_idx
  on public.member_listening_sessions (cycle_id)
  where status = 'active';

create index member_listening_sessions_last_active_idx
  on public.member_listening_sessions (last_active_at desc);

comment on table public.member_listening_sessions is
  'Signed-in listener pinned to a catalog cycle until finished or expired (abandoned timeout).';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.catalog_cycles enable row level security;
alter table public.catalog_cycle_episodes enable row level security;
alter table public.member_listening_sessions enable row level security;

create policy catalog_cycles_public_read on public.catalog_cycles
  for select using (true);

create policy catalog_cycle_episodes_public_read on public.catalog_cycle_episodes
  for select using (true);

create policy member_listening_sessions_select_own on public.member_listening_sessions
  for select using (auth.uid() = user_id);

create policy member_listening_sessions_insert_own on public.member_listening_sessions
  for insert with check (auth.uid() = user_id);

create policy member_listening_sessions_update_own on public.member_listening_sessions
  for update using (auth.uid() = user_id);
