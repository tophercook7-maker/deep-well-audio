-- Idempotency + light archive for weekly World Watch emails (Premium members only; app uses service role).

create table if not exists public.world_watch_digest_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_key text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  provider_message_id text,
  created_at timestamptz not null default now(),
  unique (campaign_key, user_id)
);

create index if not exists world_watch_digest_sends_campaign_idx
  on public.world_watch_digest_sends (campaign_key);

comment on table public.world_watch_digest_sends is
  'World Watch weekly digest send log; RLS on, no policies — use service role from cron route only';

alter table public.world_watch_digest_sends enable row level security;
2