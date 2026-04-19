alter table public.study_saved_verses add column if not exists entry_kind text default 'verse';

update public.study_saved_verses
set entry_kind = 'verse'
where entry_kind is null;

alter table public.study_saved_verses
alter column entry_kind set not null;

alter table public.study_saved_verses
  drop constraint if exists study_saved_verses_entry_kind_check;

alter table public.study_saved_verses
  add constraint study_saved_verses_entry_kind_check
  check (entry_kind in ('verse', 'reader'));

comment on column public.study_saved_verses.entry_kind is 'verse = verse drawer save; reader = chapter reading save (reopens reader).';
