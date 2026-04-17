/**
 * Future: transactional / retention email hooks (Resend, Postmark, etc.).
 * Call these from API routes or jobs when infra is ready — they no-op today.
 */

export type RetentionEmailKind = "saved_teaching" | "resume_listening" | "notes_waiting";

export function scheduleRetentionEmail(_userId: string, _kind: RetentionEmailKind, _payload?: Record<string, string>): void {
  // Intentionally empty — wire to your provider when available.
}
