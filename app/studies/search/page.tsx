import type { Metadata } from "next";
import { BackButton } from "@/components/buttons/back-button";
import { StudiesHub } from "@/components/studies/studies-hub";

export const metadata: Metadata = {
  title: "Search studies",
  description: "Search Deep Well topical studies, lessons, and themes.",
};

export default async function StudiesSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qRaw = typeof sp.q === "string" ? sp.q.trim() : "";

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/studies" label="Studies" />
      </div>
      <StudiesHub initialQuery={qRaw} formAction="/studies/search" />
    </main>
  );
}
