import { Suspense } from "react";
import { BibleListenPageClient } from "@/components/bible/bible-listen-page-client";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionBackLink } from "@/components/shared/section-back-link";
import { getSessionUser } from "@/lib/auth";

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

export default async function BibleListenPage() {
  const user = await getSessionUser();
  const signedIn = Boolean(user);

  return (
    <main className="container-shell py-12 sm:py-16">
      <div className="space-y-3 border-b border-stone-800/45 pb-6">
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
      <div className="mt-12 sm:mt-14">
        <Suspense fallback={<ListenFallback />}>
          <BibleListenPageClient signedIn={signedIn} />
        </Suspense>
      </div>
    </main>
  );
}
