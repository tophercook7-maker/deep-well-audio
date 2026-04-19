import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MeNotesClient } from "@/components/me/me-notes-client";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My notes",
  description: "Verse, chapter, topic, and lesson notes from your Bible study.",
};

export default async function MeNotesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/?signin=1");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Notes</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Notes are keyed to stable references (verse, chapter, topic, lesson). Edit or remove from here or from the Bible reader.
      </p>
      <MeNotesClient />
    </div>
  );
}
