export type ContentVisibility = "public" | "private";

export type ContentVisibilityContext = {
  section?: "world-watch" | "church-feed" | "general";
  markedPrivate?: boolean;
  containsMemberPersonalInformation?: boolean;
  containsFinancialRecords?: boolean;
  containsSensitivePrayerDetails?: boolean;
  containsChildOrFamilyForms?: boolean;
  containsVolunteerOrSecuritySchedules?: boolean;
  containsInternalLeadershipOrAdminMaterials?: boolean;
};

export const PRIVATE_CONTENT_REASONS = [
  "Member personal information",
  "Financial records",
  "Sensitive prayer details",
  "Child/family forms",
  "Volunteer/security schedules",
  "Internal leadership/admin materials",
] as const;

export function resolveContentVisibility(context: ContentVisibilityContext = {}): ContentVisibility {
  if (context.section === "world-watch") return "public";

  if (context.section === "church-feed" && context.markedPrivate) return "private";

  if (
    context.containsMemberPersonalInformation ||
    context.containsFinancialRecords ||
    context.containsSensitivePrayerDetails ||
    context.containsChildOrFamilyForms ||
    context.containsVolunteerOrSecuritySchedules ||
    context.containsInternalLeadershipOrAdminMaterials
  ) {
    return "private";
  }

  return "public";
}

export const CONTENT_VISIBILITY_RULE = {
  defaultVisibility: "public" satisfies ContentVisibility,
  privateOnlyFor: PRIVATE_CONTENT_REASONS,
  worldWatch: "always-public",
  churchFeed: "public-unless-post-marked-private-for-safety-or-privacy",
} as const;
