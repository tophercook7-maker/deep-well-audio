import { BackButton } from "@/components/buttons/back-button";
import { WorldWatchAdminEditor } from "@/components/world-watch/world-watch-admin-editor";

export default function AdminWorldWatchNewPage() {
  return (
    <main className="container-shell max-w-2xl space-y-8 py-12 sm:py-14">
      <div className="border-b border-line/50 pb-5">
        <BackButton fallbackHref="/admin/world-watch" label="World Watch admin" />
      </div>
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-200/75">New</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">World Watch item</h1>
        <p className="mt-2 text-sm text-muted">Drafts stay hidden until you publish.</p>
      </header>
      <WorldWatchAdminEditor mode="create" listHref="/admin/world-watch" />
    </main>
  );
}
