import type { Metadata, Route } from "next";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SectionBackLink } from "@/components/shared/section-back-link";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Series: ${slug}`,
    description: "Multi-part study series coming soon to Deep Well Audio.",
  };
}

export default async function StudiesSeriesPlaceholderPage({ params }: Props) {
  const { slug } = await params;

  const title = slug.replace(/-/g, " ");

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 space-y-3 border-b border-line/50 pb-5">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" as Route },
            { label: "Studies", href: "/studies" as Route },
            { label: "Series" },
            { label: title },
          ]}
        />
        <SectionBackLink href={"/studies" as Route} label="Back to Studies" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Series</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Guided multi-part tracks will appear here—saved progress, structured readings, and linked lessons. For now, browse topics and lessons from the
          studies hub.
        </p>
      </header>
    </main>
  );
}
