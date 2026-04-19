import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MeHistoryClient } from "@/components/me/me-history-client";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Reading history",
  description: "Recently opened chapters, topics, and lessons.",
};

export default async function MeReadingHistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/?signin=1");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Reading history</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">Continue where you left off—most recent first.</p>
      <MeHistoryClient />
    </div>
  );
}
