-- Interest list for Premium (no billing). Inserts via service-role API only.
create table if not exists public.premium_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default now()
);

create unique index if not exists premium_waitlist_email_lower_key on public.premium_waitlist (lower(email));

comment on table public.premium_waitlist is 'Premium interest signups; RLS off — use service role from app API only';

alter table public.premium_waitlist enable row level security;
