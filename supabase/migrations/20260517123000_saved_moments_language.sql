-- Saved Moments: evolve timestamp bookmarks into reflection-ready moments.
-- This keeps the existing episode_bookmarks table so older saved timestamps continue to work.

alter table public.episode_bookmarks
  add column if not exists quote text,
  add column if not exists note text,
  add column if not exists scripture_ref text,
  add column if not exists topic text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists episode_bookmarks_user_created_at_desc_idx
  on public.episode_bookmarks (user_id, created_at desc);

create index if not exists episode_bookmarks_user_updated_at_desc_idx
  on public.episode_bookmarks (user_id, updated_at desc);

drop policy if exists "episode_bookmarks_update_own" on public.episode_bookmarks;
create policy "episode_bookmarks_update_own"
  on public.episode_bookmarks for update
  using (auth.uid() = user_id);

drop trigger if exists episode_bookmarks_set_updated_at on public.episode_bookmarks;
create trigger episode_bookmarks_set_updated_at
  before update on public.episode_bookmarks
  for each row
  execute function public.set_updated_at();

comment on table public.episode_bookmarks is 'Premium: saved moments with episode timestamps, optional quote, note, scripture, and topic';
comment on column public.episode_bookmarks.quote is 'Optional quote or short phrase the user wants to remember from the moment';
comment on column public.episode_bookmarks.note is 'Optional private reflection attached to the saved moment';
comment on column public.episode_bookmarks.scripture_ref is 'Optional Scripture reference connected to the saved moment';
comment on column public.episode_bookmarks.topic is 'Optional user-facing topic label for later filtering';
