-- AI-assisted Bible study breakdowns for episodes.
-- Generated server-side and cached so every page load does not call the model.

create table if not exists public.episode_study_breakdowns (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  generated_at timestamptz not null default now(),
  generated_by_model text,
  source_hash text,
  main_idea text not null,
  plain_english text not null,
  key_scriptures jsonb not null default '[]'::jsonb,
  speaker_summary jsonb not null default '[]'::jsonb,
  real_life_application jsonb not null default '[]'::jsonb,
  reflection_questions jsonb not null default '[]'::jsonb,
  five_minute_recap jsonb not null default '{}'::jsonb,
  prayer_prompt text,
  constraint episode_study_breakdowns_episode_unique unique (episode_id)
);

create index if not exists episode_study_breakdowns_episode_id_idx
  on public.episode_study_breakdowns (episode_id);

comment on table public.episode_study_breakdowns is 'Cached plain-English Bible study breakdowns for podcast/video episodes';

alter table public.episode_study_breakdowns enable row level security;

-- Public read keeps already-generated breakdowns fast and visible on episode pages.
drop policy if exists "Episode study breakdowns are readable" on public.episode_study_breakdowns;
create policy "Episode study breakdowns are readable"
  on public.episode_study_breakdowns
  for select
  using (true);

drop trigger if exists episode_study_breakdowns_set_updated_at on public.episode_study_breakdowns;
create trigger episode_study_breakdowns_set_updated_at
  before update on public.episode_study_breakdowns
  for each row
  execute function public.set_updated_at();
