import { getSessionUser } from "@/lib/auth";
import { buildChapterTtsText } from "@/lib/bible/build-chapter-tts-text";
import { bibleAudioBookSlug, resolveBibleBookFromClientParam } from "@/lib/bible/resolve-book-from-param";
import { createServiceClient } from "@/lib/db";
import { fetchPassage, isStudyTranslationId, type StudyTranslationId } from "@/lib/study/bible-api";
import {
  assertBibleTtsGenerationAllowed,
  BibleTtsRateLimitedError,
  clientIpFromRequest,
} from "@/lib/server/bible-tts-generation-rate-limit";
import { synthesizeChapterMp3WithElevenLabsVoice } from "@/lib/server/bible-tts-synthesize";
import {
  resolveElevenLabsVoiceIdForBibleAudio,
  resolveRegistryEntry,
  normalizeBibleAudioVoiceSlug,
} from "@/lib/server/bible-audio-voices";
import { bibleAudioObjectPath } from "@/lib/server/bible-audio-paths";
import { BIBLE_AUDIO_SIGNED_URL_TTL_SEC, getBibleAudioStorageBucket } from "@/lib/server/bible-audio-storage";

const STALE_GENERATING_MS = 20 * 60 * 1000;
const DEFAULT_RETRY_MS = 2000;

export type BibleAudioParams = {
  translation: StudyTranslationId;
  book: string;
  chapter: number;
  voice: string;
};

export type BibleAudioJsonResponse =
  | { ok: true; cached: boolean; audioUrl: string; voice: string; reference: string }
  | { ok: true; generating: true; retryAfterMs: number }
  | { ok: false; error: string };

type CacheRow = {
  id: string;
  translation: string;
  book_slug: string;
  chapter_number: number;
  voice_slug: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  provider: string;
  provider_voice_id: string;
  status: "generating" | "ready" | "failed";
  error_message: string | null;
  updated_at: string;
};

const inFlightByPath = new Map<string, Promise<void>>();

function isUniqueViolation(err: { code?: string } | null): boolean {
  return err?.code === "23505";
}

function isStaleGenerating(updatedAtIso: string): boolean {
  const t = Date.parse(updatedAtIso);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t > STALE_GENERATING_MS;
}

async function createSignedAudioUrl(storagePath: string): Promise<string> {
  const supabase = createServiceClient();
  if (!supabase) throw new Error("Storage is not configured.");
  const bucket = getBibleAudioStorageBucket();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, BIBLE_AUDIO_SIGNED_URL_TTL_SEC);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Could not create audio URL.");
  }
  return data.signedUrl;
}

async function fetchCacheRow(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  key: Pick<BibleAudioParams, "translation" | "chapter"> & { bookSlug: string; voiceSlug: string },
): Promise<CacheRow | null> {
  const { data, error } = await supabase
    .from("bible_audio_cache")
    .select("*")
    .eq("translation", key.translation)
    .eq("book_slug", key.bookSlug)
    .eq("chapter_number", key.chapter)
    .eq("voice_slug", key.voiceSlug)
    .maybeSingle();
  if (error) {
    console.error("bible_audio_cache select:", error.message);
    return null;
  }
  return data as CacheRow | null;
}

async function markFailed(supabase: NonNullable<ReturnType<typeof createServiceClient>>, id: string, message: string) {
  await supabase
    .from("bible_audio_cache")
    .update({
      status: "failed",
      error_message: message.slice(0, 2000),
    })
    .eq("id", id);
}

async function runGeneration(opts: {
  supabase: NonNullable<ReturnType<typeof createServiceClient>>;
  rowId: string;
  storagePath: string;
  text: string;
  elevenLabsVoiceId: string;
  rateKey: string;
}) {
  const { supabase, rowId, storagePath, text, elevenLabsVoiceId, rateKey } = opts;
  const bucket = getBibleAudioStorageBucket();

  try {
    assertBibleTtsGenerationAllowed(rateKey);
  } catch (e) {
    if (e instanceof BibleTtsRateLimitedError) {
      await markFailed(supabase, rowId, e.message);
    }
    throw e;
  }

  let audio: Uint8Array;
  try {
    audio = await synthesizeChapterMp3WithElevenLabsVoice({
      text,
      elevenLabsVoiceId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "TTS failed";
    await markFailed(supabase, rowId, msg);
    throw e;
  }

  const buf = Buffer.from(audio);
  const { error: upErr } = await supabase.storage.from(bucket).upload(storagePath, buf, {
    contentType: "audio/mpeg",
    upsert: true,
  });
  if (upErr) {
    await markFailed(supabase, rowId, upErr.message);
    throw new Error(upErr.message);
  }

  const { error: dbErr } = await supabase
    .from("bible_audio_cache")
    .update({
      status: "ready",
      file_size_bytes: buf.length,
      error_message: null,
    })
    .eq("id", rowId);

  if (dbErr) {
    console.error("bible_audio_cache ready update:", dbErr.message);
    throw new Error(dbErr.message);
  }
}

function referenceLabel(
  bookLabel: string,
  chapter: number,
  passageReference: string | null | undefined,
): string {
  const r = passageReference?.trim();
  if (r) return r;
  return `${bookLabel} ${chapter}`;
}

function dedupeByStoragePath(storagePath: string, fn: () => Promise<void>): Promise<void> {
  const existing = inFlightByPath.get(storagePath);
  if (existing) return existing;
  const p = fn().finally(() => {
    inFlightByPath.delete(storagePath);
  });
  inFlightByPath.set(storagePath, p);
  return p;
}

export async function handleBibleAudioRequest(
  params: BibleAudioParams,
  request: Request,
): Promise<BibleAudioJsonResponse> {
  const supabase = createServiceClient();
  if (!supabase) {
    return { ok: false, error: "Server storage is not configured (Supabase service role)." };
  }

  const translation = params.translation;
  if (!isStudyTranslationId(translation)) {
    return { ok: false, error: "Invalid translation." };
  }

  const bookDef = resolveBibleBookFromClientParam(params.book);
  if (!bookDef) {
    return { ok: false, error: "Unknown book." };
  }

  const chapter = Math.floor(params.chapter);
  if (chapter < 1 || chapter > 200) {
    return { ok: false, error: "Invalid chapter." };
  }

  const voiceSlug = normalizeBibleAudioVoiceSlug(params.voice);
  if (!resolveRegistryEntry(voiceSlug)) {
    return { ok: false, error: "Invalid voice." };
  }

  const elevenLabsVoiceId = resolveElevenLabsVoiceIdForBibleAudio(voiceSlug);
  if (!elevenLabsVoiceId) {
    return {
      ok: false,
      error:
        "ElevenLabs voice is not configured. Set ELEVENLABS_DEFAULT_VOICE_ID or per-voice ELEVENLABS_VOICE_* env vars.",
    };
  }

  const bookSlug = bibleAudioBookSlug(bookDef);
  const storagePath = bibleAudioObjectPath(translation, bookSlug, chapter, voiceSlug);

  const user = await getSessionUser();
  const ip = clientIpFromRequest(request);
  const rateKey = user ? `u:${user.id}` : `ip:${ip}`;

  let row = await fetchCacheRow(supabase, { translation, bookSlug, chapter, voiceSlug });

  if (row?.status === "ready") {
    try {
      const audioUrl = await createSignedAudioUrl(row.storage_path);
      return {
        ok: true,
        cached: true,
        audioUrl,
        voice: voiceSlug,
        reference: referenceLabel(bookDef.label, chapter, null),
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Could not prepare audio URL." };
    }
  }

  if (row?.status === "generating" && !isStaleGenerating(row.updated_at)) {
    return { ok: true, generating: true, retryAfterMs: DEFAULT_RETRY_MS };
  }

  const passageQuery = `${bookDef.apiSlug}+${chapter}`;
  const passage = await fetchPassage(passageQuery, translation, { cache: "no-store" });
  if (!passage?.verses?.length) {
    return { ok: false, error: "Could not load chapter text." };
  }

  const { text } = buildChapterTtsText(passage.verses, passage.reference ?? null);
  if (!text.trim()) {
    return { ok: false, error: "Empty chapter." };
  }

  row = await fetchCacheRow(supabase, { translation, bookSlug, chapter, voiceSlug });

  if (row?.status === "ready") {
    try {
      const audioUrl = await createSignedAudioUrl(row.storage_path);
      return {
        ok: true,
        cached: true,
        audioUrl,
        voice: voiceSlug,
        reference: referenceLabel(bookDef.label, chapter, passage.reference),
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Could not prepare audio URL." };
    }
  }

  if (row?.status === "generating" && !isStaleGenerating(row.updated_at)) {
    return { ok: true, generating: true, retryAfterMs: DEFAULT_RETRY_MS };
  }

  if (row && row.status === "generating" && isStaleGenerating(row.updated_at)) {
    const staleRow = row;
    const staleBefore = new Date(Date.now() - STALE_GENERATING_MS).toISOString();
    const { data: claimed } = await supabase
      .from("bible_audio_cache")
      .update({ error_message: null })
      .eq("id", staleRow.id)
      .eq("status", "generating")
      .lt("updated_at", staleBefore)
      .select("id")
      .maybeSingle();

    if (claimed) {
      await dedupeByStoragePath(storagePath, () =>
        runGeneration({
          supabase,
          rowId: staleRow.id,
          storagePath,
          text,
          elevenLabsVoiceId,
          rateKey,
        }),
      );
      try {
        const audioUrl = await createSignedAudioUrl(storagePath);
        return {
          ok: true,
          cached: false,
          audioUrl,
          voice: voiceSlug,
          reference: referenceLabel(bookDef.label, chapter, passage.reference),
        };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Audio unavailable after generation." };
      }
    }

    row = await fetchCacheRow(supabase, { translation, bookSlug, chapter, voiceSlug });
    if (row?.status === "ready") {
      try {
        const audioUrl = await createSignedAudioUrl(row.storage_path);
        return {
          ok: true,
          cached: true,
          audioUrl,
          voice: voiceSlug,
          reference: referenceLabel(bookDef.label, chapter, passage.reference),
        };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Could not prepare audio URL." };
      }
    }
    if (row?.status === "generating") {
      return { ok: true, generating: true, retryAfterMs: DEFAULT_RETRY_MS };
    }
  }

  if (row && row.status === "failed") {
    const failedRow = row;
    const { data: reopened } = await supabase
      .from("bible_audio_cache")
      .update({ status: "generating", error_message: null })
      .eq("id", failedRow.id)
      .eq("status", "failed")
      .select("id")
      .maybeSingle();

    if (reopened) {
      try {
        await dedupeByStoragePath(storagePath, () =>
          runGeneration({
            supabase,
            rowId: failedRow.id,
            storagePath,
            text,
            elevenLabsVoiceId,
            rateKey,
          }),
        );
        const audioUrl = await createSignedAudioUrl(storagePath);
        return {
          ok: true,
          cached: false,
          audioUrl,
          voice: voiceSlug,
          reference: referenceLabel(bookDef.label, chapter, passage.reference),
        };
      } catch (e) {
        if (e instanceof BibleTtsRateLimitedError) {
          return { ok: false, error: e.message };
        }
        return { ok: false, error: e instanceof Error ? e.message : "Generation failed." };
      }
    }
  }

  const insertPayload = {
    translation,
    book_slug: bookSlug,
    chapter_number: chapter,
    voice_slug: voiceSlug,
    storage_path: storagePath,
    mime_type: "audio/mpeg",
    provider: "elevenlabs",
    provider_voice_id: elevenLabsVoiceId,
    status: "generating" as const,
  };

  const { data: inserted, error: insErr } = await supabase.from("bible_audio_cache").insert(insertPayload).select("id").maybeSingle();

  if (insErr && !isUniqueViolation(insErr)) {
    return { ok: false, error: insErr.message };
  }

  if (isUniqueViolation(insErr) || !inserted) {
    row = await fetchCacheRow(supabase, { translation, bookSlug, chapter, voiceSlug });
    if (row?.status === "ready") {
      try {
        const audioUrl = await createSignedAudioUrl(row.storage_path);
        return {
          ok: true,
          cached: true,
          audioUrl,
          voice: voiceSlug,
          reference: referenceLabel(bookDef.label, chapter, passage.reference),
        };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Could not prepare audio URL." };
      }
    }
    if (row?.status === "generating") {
      return { ok: true, generating: true, retryAfterMs: DEFAULT_RETRY_MS };
    }
    if (row?.status === "failed") {
      return { ok: false, error: row.error_message || "Previous generation failed. Try again shortly." };
    }
    return { ok: true, generating: true, retryAfterMs: DEFAULT_RETRY_MS };
  }

  try {
    await dedupeByStoragePath(storagePath, () =>
      runGeneration({
        supabase,
        rowId: inserted.id,
        storagePath,
        text,
        elevenLabsVoiceId,
        rateKey,
      }),
    );
    const audioUrl = await createSignedAudioUrl(storagePath);
    return {
      ok: true,
      cached: false,
      audioUrl,
      voice: voiceSlug,
      reference: referenceLabel(bookDef.label, chapter, passage.reference),
    };
  } catch (e) {
    if (e instanceof BibleTtsRateLimitedError) {
      return { ok: false, error: e.message };
    }
    return { ok: false, error: e instanceof Error ? e.message : "Generation failed." };
  }
}
