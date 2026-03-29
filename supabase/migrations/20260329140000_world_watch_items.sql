-- Curated World Watch items; server-loaded for Premium only (service role). Admin CRUD via FEEDBACK_ADMIN_EMAILS-gated APIs.

create table if not exists public.world_watch_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz not null default now(),
  title text not null,
  slug text not null,
  source_name text,
  source_url text,
  image_url text,
  summary text not null,
  reflection text,
  category text,
  is_published boolean not null default true,
  constraint world_watch_items_slug_unique unique (slug),
  constraint world_watch_items_category_check check (
    category is null
    or category in ('global', 'faith_public_life', 'culture', 'prayer_watch', 'other')
  )
);

create index if not exists world_watch_items_published_at_desc_idx
  on public.world_watch_items (published_at desc);

create index if not exists world_watch_items_is_published_idx
  on public.world_watch_items (is_published)
  where is_published = true;

comment on table public.world_watch_items is 'Premium World Watch feed; RLS on, no policies — service role from app only';

alter table public.world_watch_items enable row level security;

drop trigger if exists world_watch_items_set_updated_at on public.world_watch_items;
create trigger world_watch_items_set_updated_at
  before update on public.world_watch_items
  for each row
  execute function public.set_updated_at();
