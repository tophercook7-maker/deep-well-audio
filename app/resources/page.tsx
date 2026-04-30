import { ChurchPublicPage } from "@/components/church/church-public-page";
import { GRACE_CHURCH } from "@/data/grace-church";

export const metadata = {
  title: "Resources · Grace Church",
  description: "Public resources connected to Grace Church and Deep Well Audio.",
};

export default function ResourcesPage() {
  return (
    <ChurchPublicPage
      eyebrow="Resources"
      title="Public resources for Scripture, teaching, and return."
      description="Resources that help guests and church members read, listen, and grow should stay open. Personal notes, saved items, giving records, and member-only documents remain private."
      cards={[
        {
          title: "Bible",
          body: "Open Scripture in Deep Well Audio without creating an account.",
        },
        {
          title: "Curated teachings",
          body: "Browse public sermons, Bible teaching, and Christian living resources.",
        },
        {
          title: "World Watch",
          body: "A public current-events video resource shared from a Christian worldview.",
        },
        {
          title: "Church Feed",
          body: "Open updates, announcements, events, messages, and moments from the life of our church.",
        },
        {
          title: "Other public resources",
          body: "Open Scripture, sermons, curated teachings, and church links without requiring a member login.",
        },
      ]}
      actions={[
        { label: "Open Bible", href: "/bible" },
        { label: "World Watch", href: "/resources/world-watch" },
        { label: "Church Feed", href: "/resources/church-feed" },
        { label: "Curated teachings", href: "/curated-teachings" },
        { label: "Church website", href: GRACE_CHURCH.websiteUrl, external: true },
      ]}
    />
  );
}
