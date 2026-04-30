import { ChurchPublicPage } from "@/components/church/church-public-page";
import { GRACE_CHURCH } from "@/data/grace-church";

export const metadata = {
  title: "Ministries · Grace Church",
  description: "Public ministry information for Grace Church in Hot Springs, Arkansas.",
};

export default function MinistriesPage() {
  return (
    <ChurchPublicPage
      eyebrow="Ministries"
      title="A local church life you can explore openly."
      description="Ministry information should be easy for guests and neighbors to find. Public ministry pages stay open; private volunteer, security, kids, and member-only details belong behind authentication."
      cards={[
        {
          title: "Worship and teaching",
          body: "The weekly gathering is centered on worship and clear, simple preaching of the Word.",
        },
        {
          title: "Christian formation",
          body: "Resources and teaching are available to help people grow in Scripture, prayer, and faithful life together.",
        },
        {
          title: "Local church connection",
          body: "Grace Church is the local church connection for Deep Well Audio in Hot Springs, Arkansas.",
        },
        {
          title: "Private ministry details",
          body: "Volunteer schedules, security plans, kids ministry forms, and internal leadership documents should remain protected.",
        },
      ]}
      actions={[
        { label: "Visit Grace Church", href: "/visit" },
        { label: "Church website", href: GRACE_CHURCH.websiteUrl, external: true },
      ]}
    />
  );
}
