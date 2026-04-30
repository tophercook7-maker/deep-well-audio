import { ChurchPublicPage } from "@/components/church/church-public-page";
import { GRACE_CHURCH } from "@/data/grace-church";

export const metadata = {
  title: "Sermons · Grace Church",
  description: "Watch Grace Church sermons and teaching from Hot Springs, Arkansas.",
};

export default function SermonsPage() {
  return (
    <ChurchPublicPage
      eyebrow="Sermons"
      title="Grace Church teaching is open to everyone."
      description="Sermons and public teaching are not member-only content. Watch Grace Church sermons through the public YouTube channel or browse the curated teaching feed when items are available."
      cards={[
        {
          title: "Watch sermons",
          body: "Grace Church’s public YouTube channel is available without a Deep Well account.",
        },
        {
          title: "Curated teachings",
          body: "Grace Church has been added as a free curated source for sermons and Christian living.",
        },
        {
          title: "No premium gate",
          body: "Public sermons should remain available to guests, free users, and premium users.",
        },
        {
          title: "Local connection",
          body: GRACE_CHURCH.positioning,
        },
      ]}
      actions={[
        { label: "Watch sermons", href: GRACE_CHURCH.youtubeUrl, external: true },
        { label: "Grace Church in curated teachings", href: "/curated-teachings?source=grace-church-hot-springs" },
      ]}
    />
  );
}
