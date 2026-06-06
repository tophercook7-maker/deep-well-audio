# Changelog

All notable scheduled jobs and deployment-facing changes are documented here.

## 2026-06-04

### Scheduled catalog sync (Vercel Cron)

- **Route:** `GET /api/cron/sync-all` (authenticated with `CRON_SECRET`, same pattern as other cron handlers).
- **Schedule:** `0 */6 * * *` — every 6 hours at minute 0 UTC (00:00, 06:00, 12:00, 18:00).
- **What it does:** Refreshes podcast, sermon, and catalog YouTube content from `data/source-feeds.ts` into `shows` and `episodes` (RSS + YouTube when `YOUTUBE_API_KEY` is set).
- **Manual sync unchanged:** `POST /api/sync/all` still uses `SYNC_API_SECRET` (e.g. `scripts/resync.mjs`).

**Production checklist:** Set `CRON_SECRET` in Vercel environment variables and redeploy so `vercel.json` cron invocations authenticate successfully.

### Session-safe catalog cycles

Scheduled and manual full syncs now use a **staged → active** promotion pipeline so catalog rotation does not disrupt in-progress listeners.

| Term | Meaning |
|------|---------|
| **Staged cycle** | Newly synced snapshot (`catalog_cycle_episodes`) waiting to become visible |
| **Active cycle** | Current default batch for guests and members without an unfinished session |
| **Member session cycle** | Cycle pinned to a signed-in listener while playback is in progress |

**Behavior**

1. Cron/manual sync still ingests RSS + catalog YouTube into `shows` / `episodes` every 6 hours.
2. After ingest, the run rebuilds the **staged** snapshot (top featured-pool episodes).
3. **Promotion** (staged → active) is deferred while any signed-in member has an **active** listening session on the current active cycle.
4. Members who started during a cycle keep that snapshot on home, browse, and topic hubs until they **finish** (≥92% progress) or the session **expires** (default **48 hours** without playback activity; override with `CATALOG_SESSION_TIMEOUT_HOURS`).
5. Guests and members without an active unfinished session see the newest **active** cycle.
6. Direct episode URLs still work; cycle filtering applies to catalog listing surfaces.

**Schema:** `supabase/migrations/20260604120000_catalog_cycles.sql` — apply in Supabase before relying on promotion in production.

**API:** `POST /api/catalog/member-session` (`start` / `heartbeat` / `finish`) — called automatically from the global player for signed-in users.

### Grace Church — stable YouTube catalog

`grace-church-hot-springs` (`UChKe0huM96aCY8EsZfomx4w` in `data/source-feeds.ts`) is a **stable catalog show**, not part of rotating catalog cycles.

- `/api/sync/all` and the 6-hour cron fetch the **latest 25** YouTube uploads each run.
- Episodes match on **YouTube video ID** (`external_id`); new videos insert, existing rows update only when title, description, thumbnail, or publish date changes.
- Older Grace Church episodes stay in the catalog; the show page lists **newest first**.
- Stable shows are always included in **Browse** and topic search surfaces regardless of active catalog cycle.
