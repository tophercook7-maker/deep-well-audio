import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getLibraryFavorites } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ items: [] as const });
  }
  const rows = await getLibraryFavorites(user.id);
  const items = rows
    .slice(0, 8)
    .map((r) => {
      const ep = r.episode;
      const id = ep?.id?.trim() ?? "";
      if (!id) return null;
      return {
        id,
        title: ep?.title?.trim() || "Teaching",
        subtitle: ep?.show?.title?.trim() || ep?.show?.host?.trim() || "",
        created_at: r.created_at,
        href: `/episodes/${id}`,
      };
    })
    .filter(Boolean);
  return NextResponse.json({ items });
}
