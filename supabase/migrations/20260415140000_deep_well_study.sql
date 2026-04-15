-- Deep Well Study: notes, saved verses, and light history (RLS: own rows only).

create table if not exists public.study_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type text not null,
  content_key text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_notes_content_type_check check (content_type in ('verse', 'teaching')),
  constraint study_notes_content_key_len check (char_length(content_key) between 1 and 512),
  constraint study_notes_body_len check (char_length(body) <= 12000)
);

create index if not exists study_notes_user_updated_idx
  on public.study_notes (user_id, updated_at desc);

create index if not exists study_notes_user_content_idx
  on public.study_notes (user_id, content_type, content_key);

comment on table public.study_notes is 'Deep Well Study notes tied to a verse anchor or teaching id; premium unlimited, free tier capped in app logic.';

drop trigger if exists study_notes_set_updated_at on public.study_notes;
create trigger study_notes_set_updated_at
  before update on public.study_notes
  for each row
  execute function public.set_updated_at();

create table if not exists public.study_saved_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null,
  book_name text not null,
  chapter int not null,
  verse_from int not null,
  verse_to int not null,
  translation_id text not null default 'web',
  passage_label text,
  created_at timestamptz not null default now(),
  constraint study_saved_verses_chapter_check check (chapter >= 1 and chapter <= 200),
  constraint study_saved_verses_verse_check check (verse_from >= 1 and verse_to >= verse_from and verse_to <= 200),
  constraint study_saved_translation_len check (char_length(translation_id) between 2 and 16),
  constraint study_saved_unique_passage unique (user_id, book_id, chapter, verse_from, verse_to, translation_id)
);

create index if not exists study_saved_verses_user_created_idx
  on public.study_saved_verses (user_id, created_at desc);

comment on table public.study_saved_verses is 'Premium saved verse anchors for Deep Well Study.';

create table if not exists public.study_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  passage_ref text not null,
  translation_id text not null default 'web',
  opened_at timestamptz not null default now(),
  constraint study_history_ref_len check (char_length(passage_ref) between 1 and 256)
);

create index if not exists study_history_user_opened_idx
  on public.study_history (user_id, opened_at desc);

comment on table public.study_history is 'Recent passages opened in Study (primarily for Premium dashboard).';

alter table public.study_notes enable row level security;
alter table public.study_saved_verses enable row level security;
alter table public.study_history enable row level security;

create policy "study_notes_select_own"
  on public.study_notes for select using (auth.uid() = user_id);
create policy "study_notes_insert_own"
  on public.study_notes for insert with check (auth.uid() = user_id);
create policy "study_notes_update_own"
  on public.study_notes for update using (auth.uid() = user_id);
create policy "study_notes_delete_own"
  on public.study_notes for delete using (auth.uid() = user_id);

create policy "study_saved_select_own"
  on public.study_saved_verses for select using (auth.uid() = user_id);
create policy "study_saved_insert_own"
  on public.study_saved_verses for insert with check (auth.uid() = user_id);
create policy "study_saved_delete_own"
  on public.study_saved_verses for delete using (auth.uid() = user_id);

create policy "study_history_select_own"
  on public.study_history for select using (auth.uid() = user_id);
create policy "study_history_insert_own"
  on public.study_history for insert with check (auth.uid() = user_id);
create policy "study_history_delete_own"
  on public.study_history for delete using (auth.uid() = user_id);
