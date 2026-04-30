import { ChurchPublicPage } from "@/components/church/church-public-page";
import { GRACE_CHURCH } from "@/data/grace-church";

export const metadata = {
  title: "Events · Grace Church",
  description: "Public event and gathering information for Grace Church in Hot Springs, Arkansas.",
};

export default function EventsPage() {
  return (
    <ChurchPublicPage
      eyebrow="Events"
      title="Gatherings should be easy to find."
      description="Public events and regular gatherings should be visible without a login so guests, neighbors, and returning visitors know how to take the next simple step."
      cards={[
        { title: "Weekly worship", body: GRACE_CHURCH.serviceTime },
        {
          title: "Plan a visit",
          body: "If you are nearby, you are welcome to come worship, hear Scripture taught, and meet the church.",
        },
        {
          title: "Public by default",
          body: "Event pages can be public unless they include private addresses, child-related forms, security details, or member-only information.",
        },
        {
          title: "Check current details",
          body: "For the latest church calendar and updates, visit Grace Church’s website.",
        },
      ]}
      actions={[
        { label: "Visit church website", href: GRACE_CHURCH.websiteUrl, external: true },
        { label: "Get directions", href: GRACE_CHURCH.directionsUrl, external: true },
      ]}
    />
  );
}
