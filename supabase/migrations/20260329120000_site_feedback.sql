-- User feedback / issues; inserts via app API (service role). Admin review in-app with FEEDBACK_ADMIN_EMAILS.

create table if not exists public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  category text not null,
  message text not null,
  page_url text,
  user_agent text,
  status text not null default 'new',
  admin_note text,
  constraint site_feedback_category_check check (category in ('bug', 'suggestion', 'billing', 'content', 'other')),
  constraint site_feedback_status_check check (status in ('new', 'in_progress', 'fixed', 'closed'))
);

create index if not exists site_feedback_created_at_desc_idx
  on public.site_feedback (created_at desc);

comment on table public.site_feedback is 'Support feedback; RLS on, no policies — service role from API only';

alter table public.site_feedback enable row level security;

drop trigger if exists site_feedback_set_updated_at on public.site_feedback;
create trigger site_feedback_set_updated_at
  before update on public.site_feedback
  for each row
  execute function public.set_updated_at();
