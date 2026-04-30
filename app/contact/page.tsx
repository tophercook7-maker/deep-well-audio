import { ChurchPublicPage } from "@/components/church/church-public-page";
import { GRACE_CHURCH } from "@/data/grace-church";

export const metadata = {
  title: "Contact · Grace Church",
  description: "Public contact and visit information for Grace Church in Hot Springs, Arkansas.",
};

export default function ContactPage() {
  return (
    <ChurchPublicPage
      eyebrow="Contact"
      title="Find Grace Church in Hot Springs."
      description="Contact and visit information should be public and easy to reach. If you are nearby or planning a visit, you are welcome to start here."
      cards={[
        { title: "Sunday gathering", body: GRACE_CHURCH.serviceTime },
        { title: "Address", body: `${GRACE_CHURCH.addressLine1}, ${GRACE_CHURCH.addressLine2}` },
        {
          title: "Website",
          body: "Use the church website for current contact details and public updates.",
        },
        {
          title: "Directions",
          body: "Open directions before you come so the first visit feels simple.",
        },
      ]}
      actions={[
        { label: "Visit website", href: GRACE_CHURCH.websiteUrl, external: true },
        { label: "Get directions", href: GRACE_CHURCH.directionsUrl, external: true },
        { label: "Send Deep Well feedback", href: "/feedback" },
      ]}
    />
  );
}
