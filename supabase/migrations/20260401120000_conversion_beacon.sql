-- Lightweight first-party page beacons for internal conversion funnel views (service role insert only).
create table if not exists public.conversion_beacon_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  page text not null
);

create index if not exists conversion_beacon_events_created_at_idx on public.conversion_beacon_events (created_at desc);
create index if not exists conversion_beacon_events_page_created_at_idx on public.conversion_beacon_events (page, created_at desc);

comment on table public.conversion_beacon_events is 'Anonymous page-load beacons for /admin/metrics; insert via service-role API only';

alter table public.conversion_beacon_events enable row level security;
