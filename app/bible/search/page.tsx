import type { Metadata } from "next";
import { BibleSearchClient } from "@/components/bible/bible-search-client";
import { BackButton } from "@/components/buttons/back-button";

export const metadata: Metadata = {
  title: "Search the Bible",
  description: "Find Scripture by reference or search indexed verse text.",
};

export default async function BibleSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qRaw = typeof sp.q === "string" ? sp.q : "";

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-8 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/bible" label="Bible" />
      </div>
      <BibleSearchClient initialQuery={qRaw} />
    </main>
  );
}
