-- Premium depth fields for World Watch written items (service-role reads; strip before sending to non-premium clients).

alter table public.world_watch_items
  add column if not exists public_teaser text,
  add column if not exists member_commentary text,
  add column if not exists scripture_refs text,
  add column if not exists discernment_notes text,
  add column if not exists key_takeaways text;

comment on column public.world_watch_items.public_teaser is 'Short public-facing summary for teasers; falls back to summary truncation when null.';
comment on column public.world_watch_items.member_commentary is 'Premium-only extended editorial / pastoral commentary.';
comment on column public.world_watch_items.scripture_refs is 'Premium: Scripture references (plain text or one-per-line).';
comment on column public.world_watch_items.discernment_notes is 'Premium: discernment / angles for members.';
comment on column public.world_watch_items.key_takeaways is 'Premium: bullet-style takeaways (plain text).';
