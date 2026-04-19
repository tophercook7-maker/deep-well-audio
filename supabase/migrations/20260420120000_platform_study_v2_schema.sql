-- Platform study v2: UUID-based Bible metadata, study catalog, user study state.
-- Replaces public.bible_* / study_* / study_user_* from 20260418120000_bible_study_platform.sql.

-- ─── Tear down previous platform tables (order: dependents first)
DROP TABLE IF EXISTS public.bible_verses CASCADE;
DROP TABLE IF EXISTS public.study_lessons CASCADE;
DROP TABLE IF EXISTS public.study_topics CASCADE;
DROP TABLE IF EXISTS public.study_series CASCADE;
DROP TABLE IF EXISTS public.study_categories CASCADE;
DROP TABLE IF EXISTS public.bible_books CASCADE;
DROP TABLE IF EXISTS public.bible_translations CASCADE;
DROP TABLE IF EXISTS public.study_user_history CASCADE;
DROP TABLE IF EXISTS public.study_user_saved_lessons CASCADE;
DROP TABLE IF EXISTS public.study_user_bookmarks CASCADE;
DROP TABLE IF EXISTS public.study_user_highlights CASCADE;
DROP TABLE IF EXISTS public.study_user_notes CASCADE;

-- ─── Bible content
CREATE TABLE public.bible_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.bible_translations (id, code, name, description, is_active) VALUES
  ('a0000001-0000-4000-8000-000000000001'::uuid, 'web', 'World English Bible', 'Public domain; bible-api.com', true),
  ('a0000001-0000-4000-8000-000000000002'::uuid, 'kjv', 'King James Version', 'Public domain; bible-api.com', true),
  ('a0000001-0000-4000-8000-000000000003'::uuid, 'asv', 'American Standard Version (1901)', 'Public domain; bible-api.com', true);

CREATE TABLE public.bible_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  abbreviation text NOT NULL,
  testament text NOT NULL CHECK (testament IN ('old', 'new')),
  sort_order integer NOT NULL,
  chapter_count integer NOT NULL CHECK (chapter_count >= 1 AND chapter_count <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bible_books_testament_sort_idx ON public.bible_books (testament, sort_order);

CREATE TABLE public.bible_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_id uuid NOT NULL REFERENCES public.bible_translations (id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.bible_books (id) ON DELETE CASCADE,
  chapter_number integer NOT NULL CHECK (chapter_number >= 1 AND chapter_number <= 200),
  verse_number integer NOT NULL CHECK (verse_number >= 1 AND verse_number <= 200),
  reference text NOT NULL,
  text text NOT NULL,
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(text, ''))) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (translation_id, book_id, chapter_number, verse_number)
);

CREATE INDEX bible_verses_lookup_idx ON public.bible_verses (translation_id, book_id, chapter_number);
CREATE INDEX bible_verses_reference_idx ON public.bible_verses (reference);
CREATE INDEX bible_verses_search_idx ON public.bible_verses USING gin (search_vector);

COMMENT ON TABLE public.bible_verses IS 'Verse text cache for search; may be empty while UI uses bible-api.com.';

-- ─── Study catalog
CREATE TABLE public.study_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.study_categories (id, slug, title, description, sort_order) VALUES
  ('b1000001-0000-4000-8000-000000000001'::uuid, 'spiritual-growth', 'Spiritual Growth', NULL, 1),
  ('b1000001-0000-4000-8000-000000000002'::uuid, 'emotional-mental-struggles', 'Emotional and Mental Struggles', NULL, 2),
  ('b1000001-0000-4000-8000-000000000003'::uuid, 'relationships', 'Relationships', NULL, 3),
  ('b1000001-0000-4000-8000-000000000004'::uuid, 'purpose-direction', 'Purpose and Direction', NULL, 4),
  ('b1000001-0000-4000-8000-000000000005'::uuid, 'hard-seasons', 'Hard Seasons', NULL, 5),
  ('b1000001-0000-4000-8000-000000000006'::uuid, 'freedom-battle', 'Freedom and Battle', NULL, 6),
  ('b1000001-0000-4000-8000-000000000007'::uuid, 'gospel-foundations', 'Gospel Foundations', NULL, 7);

CREATE TABLE public.study_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES public.study_categories (id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  intro text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  key_verse_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_topic_slugs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX study_topics_category_idx ON public.study_topics (category_id);
CREATE INDEX study_topics_status_idx ON public.study_topics (status);

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'anxiety', id, 'Anxiety', 'Trust, worry, and God''s care', '', 'published' FROM public.study_categories WHERE slug = 'emotional-mental-struggles';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'fear', id, 'Fear', 'Courage and faith in God', '', 'published' FROM public.study_categories WHERE slug = 'emotional-mental-struggles';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'grief', id, 'Grief', 'Sorrow, loss, and hope', '', 'published' FROM public.study_categories WHERE slug = 'emotional-mental-struggles';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'prayer', id, 'Prayer', 'Talking with God', '', 'published' FROM public.study_categories WHERE slug = 'spiritual-growth';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'forgiveness', id, 'Forgiveness', 'Mercy and reconciliation', '', 'published' FROM public.study_categories WHERE slug = 'spiritual-growth';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'wisdom', id, 'Wisdom', 'Discernment and the fear of the Lord', '', 'published' FROM public.study_categories WHERE slug = 'spiritual-growth';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'peace', id, 'Peace', 'Rest and trust in God', '', 'published' FROM public.study_categories WHERE slug = 'spiritual-growth';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'faith', id, 'Faith', 'Believing God', '', 'published' FROM public.study_categories WHERE slug = 'gospel-foundations';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'identity-in-christ', id, 'Identity in Christ', 'Who you are in Jesus', '', 'published' FROM public.study_categories WHERE slug = 'gospel-foundations';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'purpose', id, 'Purpose', 'Calling and direction', '', 'published' FROM public.study_categories WHERE slug = 'purpose-direction';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'healing', id, 'Healing', 'Restoration in Christ', '', 'published' FROM public.study_categories WHERE slug = 'hard-seasons';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'temptation', id, 'Temptation', 'Resistance and holiness', '', 'published' FROM public.study_categories WHERE slug = 'freedom-battle';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'spiritual-warfare', id, 'Spiritual warfare', 'Standing firm in Christ', '', 'published' FROM public.study_categories WHERE slug = 'freedom-battle';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'marriage', id, 'Marriage', 'Covenant love', '', 'published' FROM public.study_categories WHERE slug = 'relationships';

INSERT INTO public.study_topics (slug, category_id, title, summary, intro, status)
SELECT 'parenting', id, 'Parenting', 'Raising children in the Lord', '', 'published' FROM public.study_categories WHERE slug = 'relationships';

CREATE TABLE public.study_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  topic_id uuid NOT NULL REFERENCES public.study_topics (id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'guided' CHECK (level IN ('quick', 'guided', 'deep')),
  estimated_minutes integer NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  key_verse_references jsonb NOT NULL DEFAULT '[]'::jsonb,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  reflection_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  application_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  prayer text,
  related_topic_slugs jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX study_lessons_topic_idx ON public.study_lessons (topic_id);
CREATE INDEX study_lessons_status_idx ON public.study_lessons (status);
CREATE INDEX study_lessons_level_idx ON public.study_lessons (level);

CREATE TABLE public.study_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  lesson_slugs jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_minutes integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── User study state
CREATE TABLE public.study_user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('verse', 'chapter', 'topic', 'lesson')),
  reference_key text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, reference_key),
  CONSTRAINT study_user_notes_ref_len CHECK (char_length(reference_key) BETWEEN 1 AND 512),
  CONSTRAINT study_user_notes_note_len CHECK (char_length(note) <= 12000)
);

CREATE INDEX study_user_notes_user_updated_idx ON public.study_user_notes (user_id, updated_at DESC);

CREATE TABLE public.study_user_highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  translation_id uuid NOT NULL REFERENCES public.bible_translations (id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.bible_books (id) ON DELETE CASCADE,
  chapter_number integer NOT NULL CHECK (chapter_number >= 1 AND chapter_number <= 200),
  verse_number integer NOT NULL CHECK (verse_number >= 1 AND verse_number <= 200),
  color text NOT NULL CHECK (color IN ('yellow', 'blue', 'green', 'pink', 'purple')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, translation_id, book_id, chapter_number, verse_number)
);

CREATE INDEX study_user_highlights_user_idx ON public.study_user_highlights (user_id, updated_at DESC);

CREATE TABLE public.study_user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('verse', 'chapter', 'topic', 'lesson')),
  reference_key text NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, reference_key),
  CONSTRAINT study_user_bookmarks_ref_len CHECK (char_length(reference_key) BETWEEN 1 AND 512)
);

CREATE INDEX study_user_bookmarks_user_idx ON public.study_user_bookmarks (user_id, created_at DESC);

CREATE TABLE public.study_user_saved_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  lesson_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_slug),
  CONSTRAINT study_user_saved_lessons_slug_len CHECK (char_length(lesson_slug) BETWEEN 1 AND 256)
);

CREATE INDEX study_user_saved_lessons_user_idx ON public.study_user_saved_lessons (user_id, created_at DESC);

CREATE TABLE public.study_user_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('bible_chapter', 'lesson', 'topic')),
  reference_key text NOT NULL,
  progress numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, reference_key),
  CONSTRAINT study_user_history_ref_len CHECK (char_length(reference_key) BETWEEN 1 AND 512)
);

CREATE INDEX study_user_history_user_updated_idx ON public.study_user_history (user_id, updated_at DESC);

-- Triggers
DROP TRIGGER IF EXISTS study_categories_set_updated_at ON public.study_categories;
CREATE TRIGGER study_categories_set_updated_at BEFORE UPDATE ON public.study_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS study_topics_set_updated_at ON public.study_topics;
CREATE TRIGGER study_topics_set_updated_at BEFORE UPDATE ON public.study_topics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS study_lessons_set_updated_at ON public.study_lessons;
CREATE TRIGGER study_lessons_set_updated_at BEFORE UPDATE ON public.study_lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS study_series_set_updated_at ON public.study_series;
CREATE TRIGGER study_series_set_updated_at BEFORE UPDATE ON public.study_series FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS study_user_notes_set_updated_at ON public.study_user_notes;
CREATE TRIGGER study_user_notes_set_updated_at BEFORE UPDATE ON public.study_user_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS study_user_highlights_set_updated_at ON public.study_user_highlights;
CREATE TRIGGER study_user_highlights_set_updated_at BEFORE UPDATE ON public.study_user_highlights FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: public read for Bible + published study catalog
ALTER TABLE public.bible_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bible_translations_public_read" ON public.bible_translations FOR SELECT USING (true);
CREATE POLICY "bible_books_public_read" ON public.bible_books FOR SELECT USING (true);
CREATE POLICY "bible_verses_public_read" ON public.bible_verses FOR SELECT USING (true);
CREATE POLICY "study_categories_public_read" ON public.study_categories FOR SELECT USING (true);
CREATE POLICY "study_topics_published_read" ON public.study_topics FOR SELECT USING (status = 'published');
CREATE POLICY "study_lessons_published_read" ON public.study_lessons FOR SELECT USING (status = 'published');
CREATE POLICY "study_series_published_read" ON public.study_series FOR SELECT USING (status = 'published');

ALTER TABLE public.study_user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_user_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_user_saved_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_user_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "study_user_notes_select_own" ON public.study_user_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "study_user_notes_insert_own" ON public.study_user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_notes_update_own" ON public.study_user_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_notes_delete_own" ON public.study_user_notes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "study_user_highlights_select_own" ON public.study_user_highlights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "study_user_highlights_insert_own" ON public.study_user_highlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_highlights_update_own" ON public.study_user_highlights FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_highlights_delete_own" ON public.study_user_highlights FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "study_user_bookmarks_select_own" ON public.study_user_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "study_user_bookmarks_insert_own" ON public.study_user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_bookmarks_update_own" ON public.study_user_bookmarks FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_bookmarks_delete_own" ON public.study_user_bookmarks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "study_user_saved_lessons_select_own" ON public.study_user_saved_lessons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "study_user_saved_lessons_insert_own" ON public.study_user_saved_lessons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_saved_lessons_update_own" ON public.study_user_saved_lessons FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_saved_lessons_delete_own" ON public.study_user_saved_lessons FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "study_user_history_select_own" ON public.study_user_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "study_user_history_insert_own" ON public.study_user_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_history_update_own" ON public.study_user_history FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "study_user_history_delete_own" ON public.study_user_history FOR DELETE USING (auth.uid() = user_id);
