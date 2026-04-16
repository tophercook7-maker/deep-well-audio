export const STUDY_PREMIUM_UPGRADE =
  "Save your study and come back to it anytime with Deep Well Premium.";

/** `window` CustomEvent name — `StudyDashboardSection` refetches dashboard data when Study saves change. */
export const STUDY_DASHBOARD_REFRESH_EVENT = "dwa-study-dashboard-refresh";

export function dispatchStudyDashboardRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STUDY_DASHBOARD_REFRESH_EVENT));
}
