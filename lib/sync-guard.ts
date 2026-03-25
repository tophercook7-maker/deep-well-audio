import { NextResponse } from "next/server";
import { getSyncApiSecret } from "@/lib/env";

export function requireSyncSecret(request: Request): NextResponse | null {
  const secret = getSyncApiSecret();
  if (!secret) {
    return NextResponse.json({ error: "SYNC_API_SECRET is not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const url = new URL(request.url);
  const qs = url.searchParams.get("secret");

  if (bearer === secret || qs === secret) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
