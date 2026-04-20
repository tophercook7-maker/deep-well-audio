import { BiblePageClient } from "@/components/bible/bible-page-client";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export const metadata = {
  title: "Bible",
  description:
    "Read Scripture with calm focus—browse every book, listen chapter by chapter, search the text, and keep notes and highlights as you study.",
};

export default function BiblePage() {
  return (
    <main className="container-shell py-12 sm:py-16">
      <div className="border-b border-stone-800/45 pb-6">
        <Breadcrumbs
          tone="bible"
          items={[
            { label: "Home", href: "/" },
            { label: "Bible" },
          ]}
        />
      </div>
      <div className="mt-10 sm:mt-12">
        <BiblePageClient />
      </div>
    </main>
  );
}
