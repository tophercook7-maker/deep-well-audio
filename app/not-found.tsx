import Link from "next/link";
import { DeepWellLogo } from "@/components/brand/deep-well-logo";

export default function NotFound() {
  return (
    <main className="container-shell flex min-h-[70vh] items-center justify-center py-20">
      <div className="card max-w-xl p-8 text-center sm:p-10">
        <div className="flex justify-center">
          <DeepWellLogo variant="inline" brandClassName="items-center mx-auto mb-7" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-amber-200/65">Not found</p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">That page ran dry.</h1>
        <p className="mt-4 leading-relaxed text-muted">
          Head back to the directory and keep digging for something worth hearing.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
