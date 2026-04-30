import { ChurchPublicPage } from "@/components/church/church-public-page";
import { GRACE_CHURCH } from "@/data/grace-church";
import { resolveContentVisibility } from "@/lib/content-visibility";

export const metadata = {
  title: "Church Feed · Grace Church",
  description: "Public updates, announcements, events, messages, and moments from the life of Grace Church.",
};

export default function ChurchFeedPage() {
  const visibility = resolveContentVisibility({ section: "church-feed" });

  return (
    <div data-content-visibility={visibility}>
      <ChurchPublicPage
        eyebrow="Resources"
        title="Church Feed"
        description="Stay connected with updates, announcements, events, messages, and moments from the life of our church. This open feed is available to everyone and is designed to help visitors, members, and families stay informed and encouraged."
        cards={[
          {
            title: "Allowed public feed content",
            body: "Weekly announcements, sermon/message links, event reminders, outreach updates, encouraging posts, public prayer themes, resource updates, and public event photos with permission.",
          },
          {
            title: "Do not include publicly",
            body: "Personal prayer requests with private details; member addresses, phone numbers, or emails; giving records; volunteer/security schedules; internal leadership documents; kids ministry forms; or children’s names/photos without proper permission.",
          },
          {
            title: "Open to visitors and members",
            body: "The Church Feed should not require login. It is public front-door content for people who want to stay informed and encouraged.",
          },
          {
            title: "Current church links",
            body: "Use Grace Church’s public website and sermon channel for current updates, teaching, and public church information.",
          },
        ]}
        actions={[
          { label: "Watch sermons", href: GRACE_CHURCH.youtubeUrl, external: true },
          { label: "Curated Grace Church feed", href: "/curated-teachings?source=grace-church-hot-springs" },
          { label: "Visit website", href: GRACE_CHURCH.websiteUrl, external: true },
        ]}
      />
    </div>
  );
}
