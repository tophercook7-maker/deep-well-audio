import type { Metadata, Route } from "next";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionBackLink } from "@/components/shared/section-back-link";
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
      <div className="mb-6 space-y-3 border-b border-line/50 pb-5">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" as Route },
            { label: "Studies", href: "/studies" as Route },
            { label: "Search" },
          ]}
        />
        <SectionBackLink href={"/studies" as Route} label="Back to Studies" />
      </div>
      <StudiesHub initialQuery={qRaw} formAction="/studies/search" />
    </main>
  );
}
