import { Suspense } from "react";
import { BackButton } from "@/components/buttons/back-button";
import { BibleListenPageClient } from "@/components/bible/bible-listen-page-client";

export const metadata = {
  title: "Read & listen — Bible",
  description:
    "Read Scripture chapter by chapter while listening—choose translation and voice, follow along verse by verse.",
};

function ListenFallback() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <p className="text-sm text-slate-500">Loading…</p>
    </div>
  );
}

export default function BibleListenPage() {
  return (
    <main className="container-shell py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/bible" label="Bible" />
      </div>
      <div className="mt-10">
        <Suspense fallback={<ListenFallback />}>
          <BibleListenPageClient />
        </Suspense>
      </div>
    </main>
  );
}
