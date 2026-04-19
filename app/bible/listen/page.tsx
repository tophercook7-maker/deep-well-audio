import { Suspense } from "react";
import { BibleListenPageClient } from "@/components/bible/bible-listen-page-client";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionBackLink } from "@/components/shared/section-back-link";

export const metadata = {
  title: "Read & listen — Bible",
  description:
    "Read Scripture chapter by chapter while listening—choose translation and voice, follow along verse by verse.",
};

function ListenFallback() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <p className="text-sm text-stone-400">Loading…</p>
    </div>
  );
}

export default function BibleListenPage() {
  return (
    <main className="container-shell py-12 sm:py-16">
      <div className="space-y-3 rounded-2xl border border-stone-800/80 bg-stone-950/55 px-4 py-5 sm:px-5">
        <Breadcrumbs
          tone="bible"
          items={[
            { label: "Home", href: "/" },
            { label: "Bible", href: "/bible" },
            { label: "Listen" },
          ]}
        />
        <SectionBackLink href="/bible" label="Back to Bible" tone="bible" />
      </div>
      <div className="mt-10">
        <Suspense fallback={<ListenFallback />}>
          <BibleListenPageClient />
        </Suspense>
      </div>
    </main>
  );
}
