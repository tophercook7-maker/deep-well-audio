import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { BackButton } from "@/components/buttons/back-button";

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

  return (
    <main className="container-shell py-12 sm:py-14">
      <div className="mb-6 border-b border-line/50 pb-5">
        <BackButton fallbackHref="/studies" label="Studies" />
      </div>

      <header className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">Series</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{slug.replace(/-/g, " ")}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300/95">
          Guided multi-part tracks will appear here—saved progress, structured readings, and linked lessons. For now, browse topics and lessons from the
          studies hub.
        </p>
        <p className="mt-6">
          <Link href={"/studies" as Route} className="font-medium text-amber-200/85 underline-offset-2 hover:underline">
            ← Back to studies
          </Link>
        </p>
      </header>
    </main>
  );
}
