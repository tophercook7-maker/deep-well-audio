-- Premium: timestamp bookmarks and private notes per episode (RLS: own rows only).

create table if not exists public.episode_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  seconds integer not null,
  label text,
  created_at timestamptz not null default now()
);

create table if not exists public.episode_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists episode_bookmarks_user_episode_idx
  on public.episode_bookmarks (user_id, episode_id);

create index if not exists episode_notes_user_episode_idx
  on public.episode_notes (user_id, episode_id);

drop trigger if exists episode_notes_set_updated_at on public.episode_notes;
create trigger episode_notes_set_updated_at
  before update on public.episode_notes
  for each row
  execute function public.set_updated_at();

alter table public.episode_bookmarks enable row level security;
alter table public.episode_notes enable row level security;

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

comment on table public.episode_bookmarks is 'Premium: per-user playback timestamp bookmarks';
comment on table public.episode_notes is 'Premium: per-user private notes on an episode';
