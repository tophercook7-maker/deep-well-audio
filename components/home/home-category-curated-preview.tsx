import { getCuratedCategoriesForNav } from "@/lib/curated-teachings/categories";
import { CuratedSectionShell } from "@/components/home/curated-section-shell";
import { HomeCategoryCuratedPreviewGrid } from "@/components/home/home-category-curated-preview-grid";

export function HomeCategoryCuratedPreview() {
  const cats = getCuratedCategoriesForNav();

  return (
    <section
      className="container-shell section-divider scroll-mt-28 py-10 sm:py-12"
      aria-labelledby="home-curated-cats-heading"
    >
      <CuratedSectionShell>
        <div className="mb-8 max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-200/70">Browse</p>
          <h2 id="home-curated-cats-heading" className="mt-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Explore by Category
          </h2>
          <p className="mt-3.5 text-sm leading-[1.65] text-slate-400 sm:text-[0.9375rem]">
            Eight editorial lanes—from foundations to discernment—so the library stays ordered as it grows.
          </p>
        </div>

        <HomeCategoryCuratedPreviewGrid cats={cats} />
      </CuratedSectionShell>
    </section>
  );
}
