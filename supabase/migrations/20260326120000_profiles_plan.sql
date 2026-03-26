-- Premium / billing fields on profiles (additive migration).
alter table public.profiles add column if not exists plan text not null default 'free';
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists subscription_status text;

alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check check (plan in ('free', 'premium'));

comment on column public.profiles.plan is 'free | premium — subscription tier';
comment on column public.profiles.stripe_customer_id is 'Optional Stripe customer id when billing is wired';
comment on column public.profiles.subscription_status is 'Optional mirror of subscription state from Stripe';
