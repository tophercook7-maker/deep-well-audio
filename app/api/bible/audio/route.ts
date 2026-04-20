import { NextResponse } from "next/server";
import { denyIfNotPremiumBibleAudio } from "@/lib/server/bible-narration-gate";
import { handleBibleAudioRequest, type BibleAudioParams } from "@/lib/server/bible-audio-request";
import { isStudyTranslationId, type StudyTranslationId } from "@/lib/study/bible-api";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function httpStatusForAudioFailure(message: string): number {
  const m = message.toLowerCase();
  if (m.includes("too many") || m.includes("rate")) return 429;
  if (
    m.includes("invalid") ||
    m.includes("unknown") ||
    m.includes("missing") ||
    m.includes("empty chapter") ||
    m.includes("could not load chapter")
  ) {
    return 400;
  }
  return 503;
}

function parseChapter(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

function buildParams(
  translation: string | null,
  book: string | null,
  chapter: number | null,
  voice: string | null,
): BibleAudioParams | { error: string } {
  if (!translation || !isStudyTranslationId(translation)) {
    return { error: "Invalid or missing translation." };
  }
  if (!book?.trim()) {
    return { error: "Missing book." };
  }
  if (chapter == null || chapter < 1) {
    return { error: "Invalid chapter." };
  }
  if (!voice?.trim()) {
    return { error: "Missing voice." };
  }
  return {
    translation: translation as StudyTranslationId,
    book: book.trim(),
    chapter,
    voice: voice.trim(),
  };
}

export async function GET(request: Request) {
  const denied = await denyIfNotPremiumBibleAudio();
  if (denied) return denied;

  const url = new URL(request.url);
  const chapter = parseChapter(url.searchParams.get("chapter"));
  if (chapter == null) {
    return NextResponse.json({ ok: false, error: "Invalid chapter." }, { status: 400 });
  }
  const params = buildParams(
    url.searchParams.get("translation"),
    url.searchParams.get("book"),
    chapter,
    url.searchParams.get("voice"),
  );
  if ("error" in params) {
    return NextResponse.json({ ok: false, error: params.error }, { status: 400 });
  }

  const out = await handleBibleAudioRequest(params, request);
  if (!out.ok) {
    return NextResponse.json(out, { status: httpStatusForAudioFailure(out.error) });
  }
  if ("generating" in out && out.generating) {
    return NextResponse.json(out, { status: 202 });
  }
  return NextResponse.json(out);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const denied = await denyIfNotPremiumBibleAudio();
  if (denied) return denied;

  const chapter = typeof body.chapter === "number" ? body.chapter : parseChapter(String(body.chapter ?? ""));
  if (chapter == null) {
    return NextResponse.json({ ok: false, error: "Invalid chapter." }, { status: 400 });
  }

  const params = buildParams(
    typeof body.translation === "string" ? body.translation : null,
    typeof body.book === "string" ? body.book : null,
    chapter,
    typeof body.voice === "string" ? body.voice : null,
  );
  if ("error" in params) {
    return NextResponse.json({ ok: false, error: params.error }, { status: 400 });
  }

  const out = await handleBibleAudioRequest(params, request);
  if (!out.ok) {
    return NextResponse.json(out, { status: httpStatusForAudioFailure(out.error) });
  }
  if ("generating" in out && out.generating) {
    return NextResponse.json(out, { status: 202 });
  }
  return NextResponse.json(out);
}
