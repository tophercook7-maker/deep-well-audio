/**
 * Copy and categories for the public Creators / partnership page.
 * Used to find Bible artists, podcasters, musicians, and allied creators for mutual growth.
 */

export type CreatorPartnerTypeId =
  | "bible-art"
  | "podcast"
  | "music"
  | "teaching"
  | "other";

export type CreatorPartnerType = {
  id: CreatorPartnerTypeId;
  label: string;
  blurb: string;
  examples: string;
};

export const CREATOR_PARTNER_TYPES: readonly CreatorPartnerType[] = [
  {
    id: "bible-art",
    label: "Bible artists & illustrators",
    blurb: "Visual storytellers who help people see Scripture—comics, maps, character art, devotionals, and more.",
    examples: "Illustrated Bibles, BibleProject-style visuals, faith-forward art accounts",
  },
  {
    id: "podcast",
    label: "Podcasts & teaching audio",
    blurb: "Sermons, Bible teaching, apologetics, and conversation shows worth returning to—not just scrolling past.",
    examples: "Independent podcasts, ministry broadcasts, interview series",
  },
  {
    id: "music",
    label: "Musicians & worship",
    blurb: "Artists whose songs and scores help people pray, remember truth, and worship in daily life.",
    examples: "Worship leaders, hymn writers, Scripture songs, instrumental study music",
  },
  {
    id: "teaching",
    label: "Channels & ministries",
    blurb: "YouTube channels, churches, and teaching ministries with a catalog people should be able to find again.",
    examples: "Teaching channels, conference archives, local church media",
  },
  {
    id: "other",
    label: "Something else",
    blurb: "If your work helps people hold onto faith—books, newsletters, film, curriculum—we still want to hear from you.",
    examples: "Authors, filmmakers, study tools, formats we have not named yet",
  },
] as const;

export const CREATOR_PARTNERSHIP_HEADLINE =
  "Build with us—artists, podcasters, musicians, and teachers who want a calmer home for their work.";

export const CREATOR_PARTNERSHIP_SUBHEAD =
  "Deep Well is looking for creators to partner with: we feature trustworthy work in one personal faith library, and you help more people discover a place that remembers what shaped them.";

export const CREATOR_PARTNERSHIP_OFFERS = [
  {
    title: "A curated home, not a feed",
    body: "Your work sits beside Bible study, trusted teaching, and saved moments—not endless scroll.",
  },
  {
    title: "Listeners who come back",
    body: "Premium is built for memory: saves, notes, and return visits. Partners reach people who intend to revisit, not just click once.",
  },
  {
    title: "Early partner terms",
    body: "We are still growing. Founding partners get a direct line, flexible placement, and room to shape how collaboration works.",
  },
  {
    title: "Mutual growth",
    body: "Simple deal at the start: we feature and integrate your catalog; you tell your audience about Deep Well when it fits naturally.",
  },
] as const;

export const CREATOR_PARTNERSHIP_LOOKING_FOR = [
  "Clear, biblically grounded work you are proud to stand behind",
  "Permission to syndicate or link your public RSS, YouTube, or audio where applicable",
  "A willingness to mention Deep Well to listeners who would benefit from a personal faith library",
  "Patience while we stay small—we reply personally and move carefully",
] as const;

export function formatCreatorPartnerInquiryMessage(input: {
  partnerType: CreatorPartnerTypeId;
  projectName: string;
  linkUrl: string;
  message: string;
}): string {
  const typeLabel =
    CREATOR_PARTNER_TYPES.find((t) => t.id === input.partnerType)?.label ?? input.partnerType;

  const lines = [
    "[Creator partnership inquiry]",
    "",
    `Type: ${typeLabel}`,
    `Project / name: ${input.projectName.trim()}`,
  ];

  if (input.linkUrl.trim()) {
    lines.push(`Link: ${input.linkUrl.trim()}`);
  }

  lines.push("", input.message.trim());
  return lines.join("\n");
}
