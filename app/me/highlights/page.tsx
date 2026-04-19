import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MeHighlightsClient } from "@/components/me/me-highlights-client";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My highlights",
  description: "Verse highlights from Scripture reading.",
};

export default async function MeHighlightsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/?signin=1");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Highlights</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">Colored verse marks sync across devices when you&apos;re signed in.</p>
      <MeHighlightsClient />
    </div>
  );
}
