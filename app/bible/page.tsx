import { BiblePageClient } from "@/components/bible/bible-page-client";
import { BackButton } from "@/components/buttons/back-button";

export const metadata = {
  title: "Bible Study",
  description: "Read Scripture and study with Deep Well—open a passage, continue where you left off, and browse saved verses.",
};

export default function BiblePage() {
  return (
    <main className="container-shell py-12 sm:py-16">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/" label="Home" />
      </div>
      <div className="mt-10">
        <BiblePageClient />
      </div>
    </main>
  );
}
