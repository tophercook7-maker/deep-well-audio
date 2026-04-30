import { ChurchPublicPage } from "@/components/church/church-public-page";
import { GRACE_CHURCH } from "@/data/grace-church";

export const metadata = {
  title: "Give · Grace Church",
  description: "Public giving information for Grace Church. Giving records remain private.",
};

export default function GivePage() {
  return (
    <ChurchPublicPage
      eyebrow="Give"
      title="Giving information can be public. Giving records stay private."
      description="A public Give page should help people understand where to give without requiring login. Personal giving history, receipts, payment methods, and financial records should remain authenticated and private."
      cards={[
        {
          title: "Public giving path",
          body: "Use Grace Church’s website for current giving details and any official giving links.",
        },
        {
          title: "No account required to learn",
          body: "Visitors should be able to find giving information without entering a member area.",
        },
        {
          title: "Private records",
          body: "Giving records, receipts, payment methods, and donor information should never be publicly exposed.",
        },
        {
          title: "Church connection",
          body: GRACE_CHURCH.positioning,
        },
      ]}
      actions={[{ label: "Visit church website", href: GRACE_CHURCH.websiteUrl, external: true }]}
    />
  );
}
