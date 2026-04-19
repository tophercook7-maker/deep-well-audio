import type { Metadata } from "next";
import { BibleSearchClient } from "@/components/bible/bible-search-client";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionBackLink } from "@/components/shared/section-back-link";

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
      <div className="mb-8 space-y-3 rounded-2xl border border-stone-800/80 bg-stone-950/55 px-4 py-5 sm:px-5">
        <Breadcrumbs
          tone="bible"
          items={[
            { label: "Home", href: "/" },
            { label: "Bible", href: "/bible" },
            { label: "Search" },
          ]}
        />
        <SectionBackLink href="/bible" label="Back to Bible" tone="bible" />
      </div>
      <BibleSearchClient initialQuery={qRaw} />
    </main>
  );
}
