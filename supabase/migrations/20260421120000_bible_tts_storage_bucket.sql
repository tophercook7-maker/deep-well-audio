-- Private bucket for cached Bible chapter MP3s (server access via service role only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bible-tts',
  'bible-tts',
  false,
  52428800,
  array['audio/mpeg']::text[]
)
on conflict (id) do nothing;
