import { ChurchPublicPage } from "@/components/church/church-public-page";
import { GRACE_CHURCH } from "@/data/grace-church";

export const metadata = {
  title: "Visit Grace Church",
  description: "Plan a visit to Grace Church in Hot Springs, Arkansas. Sunday mornings at 9:30 AM.",
};

export default function VisitPage() {
  return (
    <ChurchPublicPage
      eyebrow="Visit"
      title="You’re welcome this Sunday."
      description="Grace Church gathers in Hot Springs for worship, Scripture, and fellowship. Come as a guest, hear the Word preached clearly and simply, and meet people who would be glad to welcome you."
      cards={[
        { title: "Service time", body: GRACE_CHURCH.serviceTime },
        { title: "Address", body: `${GRACE_CHURCH.addressLine1}, ${GRACE_CHURCH.addressLine2}` },
        {
          title: "What to expect",
          body: "A simple gathering centered on worship, Scripture, prayer, and the ordinary grace of a local church family.",
        },
        {
          title: "Before you come",
          body: "No account or sign-up is needed. If you are in or near Hot Springs, you are welcome to visit.",
        },
      ]}
      actions={[
        { label: "Get directions", href: GRACE_CHURCH.directionsUrl, external: true },
        { label: "Visit church website", href: GRACE_CHURCH.websiteUrl, external: true },
      ]}
    />
  );
}
