import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MeBookmarksClient } from "@/components/me/me-bookmarks-client";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My bookmarks",
  description: "Saved Scripture and study anchors.",
};

export default async function MeBookmarksPage() {
  const user = await getSessionUser();
  if (!user) redirect("/?signin=1");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Bookmarks</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">Quick-return links for verses, chapters, topics, and lessons.</p>
      <MeBookmarksClient />
    </div>
  );
}
