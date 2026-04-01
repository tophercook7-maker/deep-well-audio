# Deep Well Audio

Next.js app for curated Christian audio (RSS sync, Supabase catalog, dark UI).

## Project root

This repository **is** the Next.js app (no nested `starter` folder). Clone, open this directory in your editor, and set Vercel **Root Directory** to **`.`** (repo root) or leave it empty.

## Local setup

1. `npm install`
3. Copy env template: `cp .env.example .env.local`
4. Fill **all required** variables in `.env.local` (see `.env.example` comments).
5. Apply `supabase/schema.sql` in the Supabase SQL editor (if not already).
6. `npm run dev` — restart after any env change.

**Optional sync secret:** generate a long random string (e.g. `openssl rand -hex 32`) and set `SYNC_API_SECRET`.

## Environment variables

| Name | Scope | Purpose |
|------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | Public | Origin for email confirmation redirects (`/auth/callback`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | RSS / ingestion (RLS bypass) |
| `SYNC_API_SECRET` | Server | Protects sync / ingest HTTP endpoints |
| `YOUTUBE_API_KEY` | Server | Optional; YouTube ingestion only |
| `NEXT_PUBLIC_PREMIUM_WAITLIST_EMAIL` | Public | Optional `mailto` helper on `/pricing` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Enables Stripe Checkout buttons in the UI |
| `STRIPE_SECRET_KEY` | Server | Stripe API secret |
| `STRIPE_WEBHOOK_SECRET` | Server | Webhook signing secret (`whsec_…`) |
| `STRIPE_PRICE_MONTHLY` | Server | Price ID for $9/mo |
| `STRIPE_PRICE_YEARLY` | Server | Price ID for $90/yr |
| `WORLD_WATCH_WEEKLY_DIGEST_ENABLED` | Server | Optional; must be `1` to allow World Watch email cron (see `.env.example`) |
| `CRON_SECRET` | Server | Optional; Bearer secret for digest route when email is enabled |
| `RESEND_API_KEY` / `RESEND_FROM_WORLD_WATCH` | Server | Optional; Resend when digest is enabled |
| `FEEDBACK_ADMIN_EMAILS` | Server | Comma-separated emails that may open `/admin/feedback` (uses `site_feedback` migration) |

Accessors live in `lib/env.ts`.

## Vercel

1. New Project → import the repo → **Root Directory:** `.` (repository root).
2. **Environment Variables:** add every key from `.env.example` (use Production + Preview as needed).
3. `NEXT_PUBLIC_SITE_URL` should be your Vercel URL (e.g. `https://<project>.vercel.app`) or your **custom domain** once connected.
4. Deploy. Re-run deploy after changing env vars.

## Supabase Auth & domains

After you have a stable URL:

1. **Authentication → URL configuration**
   - **Site URL:** same as `NEXT_PUBLIC_SITE_URL` (e.g. production domain).
   - **Redirect URLs:** include `https://<your-domain>/auth/callback` (and localhost for dev if you use email confirmation locally).
2. Keep **Site URL** and **`NEXT_PUBLIC_SITE_URL`** aligned so confirmation emails return users to your app.

Local dev typically uses `http://localhost:3000` for both, with `http://localhost:3000/auth/callback` in Redirect URLs.

## Scripts

- `npm run dev` — development
- `npm run build` / `npm start` — production (same as Vercel build)

## Free vs Premium (production-safe)

- **Guest** — Browse, search, play audio, topic hubs. No account required; listening stays free.
- **Free (signed in)** — Favorites, saved shows, library, continue listening, and recently played.
- **Premium** — Everything above plus topic packs, playlists and bookmarks (UI surfaces), advanced Explore filters (e.g. meaty score), and **World Watch** (`/world-watch`), when `profiles.plan = 'premium'` in Supabase. An optional weekly email digest for World Watch is **off by default** (no Resend/cron required for launch); see `.env.example` for `WORLD_WATCH_WEEKLY_DIGEST_ENABLED`.

The **Premium UI and gating are live**. **Stripe Checkout** (monthly/yearly) upgrades the account via webhooks into **`profiles.plan`**; configure env vars in `.env.example`. **`/pricing`** also offers a **notify-me** form (`/api/premium-waitlist`, requires `SUPABASE_SERVICE_ROLE_KEY` and the `premium_waitlist` table from `supabase/migrations`). The app does not simulate payment or upgrade without a successful Stripe subscription.

**Bookmarks & notes (Premium)** — Timestamp bookmarks (`episode_bookmarks`) and private episode notes (`episode_notes`) are gated in the UI and enforced in `/api/premium/bookmarks` and `/api/premium/notes`. Apply `supabase/migrations/20260327120000_episode_bookmarks_notes.sql`. Premium users save moments from the bottom player (“Save this moment”) and manage lists on each episode page; the library surfaces recently bookmarked episodes.

## Stripe (Premium subscriptions)

- **Env:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`, plus `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (enables client checkout buttons), and **`NEXT_PUBLIC_SITE_URL`** (absolute URLs for Checkout success/cancel). See `.env.example`.
- **Checkout:** `POST /api/stripe/create-checkout-session` with `{ "price": "monthly" | "yearly" }` (signed-in users only). Redirects to Stripe Checkout; success returns to `/library?upgraded=true`.
- **Webhooks:** `POST /api/stripe/webhook` — raw body + signature verification. Uses **`SUPABASE_SERVICE_ROLE_KEY`** to set `profiles.plan` / `subscription_status` / `stripe_customer_id`. Handle **`checkout.session.completed`**, **`invoice.payment_succeeded`**, **`customer.subscription.deleted`**.
- **Dashboard:** Create product “Deep Well Premium” with $9/mo and $90/yr recurring prices; copy Price IDs into `STRIPE_PRICE_*`. Add webhook endpoint URL (production) with the signing secret as `STRIPE_WEBHOOK_SECRET`. Metadata `user_id` is set on Checkout and subscription for reliable account linking.

## Persistent global player / background playback

- **Architecture** — One shared media element in `components/player/global-player.tsx` (usually `<audio>`, or `<video playsInline>` for **direct file-like** `video_url` assets), mounted via `PlayerProvider` in `app/layout.tsx`, so **playback survives normal in-site navigation**. State lives in React context (`lib/player/context.tsx`) + `lib/player/reducer.ts`: current track/queue, play/pause, seek, volume/mute, loading/error, `canPlay`, expanded/minimized chrome. Tracks are normalized in `lib/player/build-track.ts` (`lib/player/utils.ts` for URL heuristics). `lib/player/store.ts` re-exports types/defaults (no separate Zustand store).
- **Starting playback** — `EpisodePlayActions` (wired through `EpisodeRow` on home, explore episode view, topics, show pages, episode detail): priority **`audio_url` → direct playable `video_url`** → otherwise honest **external** actions only (`episode_url`, show `official_url`). No fake in-player URLs for YouTube/embed-only pages.
- **Continue listening / resume** — Client `localStorage` key **`deepwell:progress`** (`lib/listening-progress.ts`): per-episode position, duration, `lastPlayedAt`, plus a **recently played** id list. Progress saves on an interval while playing, on pause, and on unload/visibility hide. **Resume** applies when stored position is past ~10s and not near the end (`MIN_RESUME_SECONDS`, `NEAR_END_RATIO`). If storage is blocked (private mode), listening still works; history just won’t persist. **Continue listening** / **Recently played** sections (`components/listening/*`): shown on the homepage and library for **signed-in** free/premium users when local data exists; guests are not shown these blocks (listening still works).
- **Media Session** — `hooks/use-media-session.ts` sets title, artist (show line), album label, artwork where supported, registers **play / pause / seek backward / seek forward** (±15s), and updates **position state** when duration is known—helps lock-screen and Bluetooth controls **on supported OS/browser combos**.
- **Background playback (web honesty)** — Many browsers keep tab audio running when you **switch tabs, minimize, or use another app**—especially for real media elements started by a user gesture. There is **no OS-wide floating UI** after leaving the browser, and **no playback after the browser process is fully killed**. iOS/Safari and battery/Doze policies vary; treat continuity as best-effort.
- **Autoplay** — First play may require an extra tap if the browser blocks autoplay until interaction.

## Topics, search, and Explore

- **Topic metadata** — `lib/topics.ts` (`TOPIC_DEFINITIONS`, `DISCOVER_TOPIC_SLUGS`) powers `/topics/[slug]` copy, related links, chips/cards, and **validating** `/explore?topic=…` (unknown slugs are ignored safely).
- **Topic landing pages** — `app/topics/[slug]/page.tsx` lists newest `topic_tags` matches. **End Times** uses richer `spotlight` / `relatedSlugs` in the metadata map.
- **Explore search** — `lib/queries.ts` (`exploreShows`, `exploreEpisodes`) combines partial **ILIKE-style** text across show and episode fields, **topic_tags**, inferred-topic hits, and **show `tags`** (via embedded `show.tags`) with existing **category / source / meaty / topic** filters. Query string **`q`** is preserved on submit; chips link to `/explore?topic=…&view=episodes`.
- **Lightweight auto-tagging** — RSS/YouTube normalization calls `mergeTopicTagsFromSeedAndText` in `lib/topic-infer.ts` (keyword rules only; additive with feed seeds).

## Lightweight PWA / installability

- **Manifest** — `app/manifest.ts` (served as `/manifest.webmanifest`): `standalone` display, dark `theme_color` / `background_color`, categories, and PNG icons under **`public/icons/`**.
- **Icons** — **`npm run build:icons`** (runs as **`prebuild`**) reads **`public/logo-square.png`** (fallback: `public/logo.png`) and writes `icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png`, and **`public/favicon-32.png`**. **DevDependency:** `sharp`.
- **What you get** — Polished tab/bookmark metadata, Add to Home Screen / install UI **where the browser supports it** (often Chromium-class browsers over HTTPS with a solid manifest). There is **no service worker** yet—no offline shell, precache, or background sync—so behavior stays predictable for auth, playback, and freshness.
- **Install hint** — A small dismissible strip in **`components/pwa/install-hint.tsx`** (via **`components/site-footer.tsx`**) appears only when the browser fires `beforeinstallprompt` (may be rare without a service worker). It does not interfere with the global player.

## Brand, favicon, and social preview

- **Logos (`public/`)**  
  - **`logo.png`** — full wordmark; used in the app via `components/brand/deep-well-logo.tsx`.  
  - **`logo-square.png`** — source for **favicon + PWA/Apple** PNGs (see `scripts/generate-pwa-icons.mjs`).

- **Tab & platform icons**  
  - `public/favicon-32.png`, `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `maskable-512.png` — generated by **`npm run build:icons`** from **`logo-square.png`** (letterboxed on `#0b1220` when needed).

- **Metadata wiring (`app/layout.tsx`)**  
  Title template **`%s | Deep Well Audio`**, shared description, `themeColor`, `appleWebApp`, `icons`, Open Graph + Twitter (see below).

- **Manifest / PWA**  
  `app/manifest.ts` → `/manifest.webmanifest` (`standalone`, `#0b1220`, icon sizes + maskable).

- **Social share images**  
  `app/opengraph-image.tsx` and `app/twitter-image.tsx` (edge **`ImageResponse`**) share layout from `app/og-brand.tsx` — default 1200×630 card; per-page titles still come from the metadata template when sub-pages define `title`.
