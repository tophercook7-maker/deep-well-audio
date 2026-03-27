import Link from "next/link";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";

export default function NotFound() {
  return (
    <main className="container-shell flex min-h-[70vh] items-center justify-center py-20">
      <div className="card max-w-xl p-10 text-center">
        <div className="flex justify-center">
          <DeepWellLogo variant="inline" className="mx-auto mb-6 max-w-[260px]" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Not found</p>
        <h1 className="mt-4 text-4xl font-semibold">That page ran dry.</h1>
        <p className="mt-4 leading-7 text-muted">
          Head back to the directory and keep digging for something worth hearing.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
