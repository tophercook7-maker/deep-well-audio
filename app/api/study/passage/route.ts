import { NextResponse } from "next/server";
import { fetchPassage, isStudyTranslationId } from "@/lib/study/bible-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const t = url.searchParams.get("t")?.trim().toLowerCase() ?? "web";
  if (!q) {
    return NextResponse.json({ error: "q required" }, { status: 400 });
  }
  const translation = isStudyTranslationId(t) ? t : "web";
  const data = await fetchPassage(q, translation, { cache: "no-store" });
  if (!data) {
    return NextResponse.json({ error: "Passage not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
