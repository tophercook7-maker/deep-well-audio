-- Optional outbound reply tracking; admin_note remains the draft / stored reply text until email is wired.

alter table public.site_feedback
  add column if not exists replied_at timestamptz;

alter table public.site_feedback
  add column if not exists reply_sent boolean not null default false;

comment on column public.site_feedback.admin_note is 'Reply / reassurance draft; same text intended for email when outbound is enabled';
comment on column public.site_feedback.replied_at is 'When the reply was marked sent (automated or manual)';
comment on column public.site_feedback.reply_sent is 'True after outbound send succeeds or admin marks manual send';
