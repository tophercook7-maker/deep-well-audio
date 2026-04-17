/**
 * Calendar week boundaries (Monday UTC) — shared by client listening stats and server-side queries.
 */

/** ISO date string `YYYY-MM-DD` for Monday 00:00 UTC of the current calendar week. */
export function mondayWeekIdUtc(): string {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
  return monday.toISOString().slice(0, 10);
}

/** ISO timestamp for Monday 00:00:00.000Z of the current week (for `gte` filters). */
export function utcMondayWeekStartIso(): string {
  return `${mondayWeekIdUtc()}T00:00:00.000Z`;
}
