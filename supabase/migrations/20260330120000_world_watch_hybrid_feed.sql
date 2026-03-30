-- Hybrid World Watch: RSS ingestion (review queue), manual items, pinning.

alter table public.world_watch_items
  add column if not exists source_type text not null default 'manual',
  add column if not exists source_feed text,
  add column if not exists source_guid text,
  add column if not exists external_image_url text,
  add column if not exists pinned boolean not null default false,
  add column if not exists pinned_rank integer,
  add column if not exists ingestion_status text not null default 'ready',
  add column if not exists canonical_url text;

alter table public.world_watch_items
  drop constraint if exists world_watch_items_source_type_check;
alter table public.world_watch_items
  add constraint world_watch_items_source_type_check
    check (source_type in ('manual', 'rss'));

alter table public.world_watch_items
  drop constraint if exists world_watch_items_ingestion_status_check;
alter table public.world_watch_items
  add constraint world_watch_items_ingestion_status_check
    check (ingestion_status in ('review', 'ready'));

comment on column public.world_watch_items.source_type is 'manual = editor-created; rss = ingested feed item';
comment on column public.world_watch_items.source_feed is 'Ingest config id when source_type = rss';
comment on column public.world_watch_items.source_guid is 'RSS guid or stable id for dedupe';
comment on column public.world_watch_items.external_image_url is 'Hero image from feed; display uses image_url if set, else this';
comment on column public.world_watch_items.canonical_url is 'Original article URL for dedupe and attribution';
comment on column public.world_watch_items.ingestion_status is 'review = awaiting editor; ready = normal row';

create unique index if not exists world_watch_items_feed_guid_unique
  on public.world_watch_items (source_feed, source_guid)
  where source_feed is not null and source_guid is not null;

create unique index if not exists world_watch_items_canonical_url_unique
  on public.world_watch_items (canonical_url)
  where canonical_url is not null;

create index if not exists world_watch_items_created_at_desc_idx
  on public.world_watch_items (created_at desc);

create index if not exists world_watch_items_review_queue_idx
  on public.world_watch_items (ingestion_status, created_at desc)
  where ingestion_status = 'review';
