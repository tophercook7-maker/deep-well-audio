# Deep Well Audio

Next.js app for curated Christian audio (RSS sync, Supabase catalog, dark UI).

## Project root

The deployable app lives in **`deep-well-audio-starter/`**. Open this folder in your editor and point Vercel’s **Root Directory** here if your repo also contains other files.

## Local setup

1. `cd deep-well-audio-starter`
2. `npm install`
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

Accessors live in `lib/env.ts`.

## Vercel

1. New Project → import the repo → set **Root Directory** to `deep-well-audio-starter`.
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

## Persistent global player / background playback

- **Architecture** — One shared `<audio>` element in `components/player/global-player.tsx`, mounted via `PlayerProvider` in `app/layout.tsx`, so **playback survives normal navigation** (home → explore → show → library → auth pages, etc.). State lives in React context (`lib/player/context.tsx`) + `lib/player/reducer.ts` (track, queue, play/pause, seek, volume, `canPlay`, loading/error, expanded UI). Normalized tracks are built in `lib/player/build-track.ts` with helpers in `lib/player/utils.ts`.
- **Starting playback** — `EpisodePlayActions` on `EpisodeRow` surfaces (home, explore, show pages, episode detail) and library favorites: **`audio_url`** drives the global player; **direct file–like `video_url`** may play in `<audio>`; **YouTube/Vimeo** and **episode-only URLs** use clear external actions (Watch / Listen on source / Open source)—no fake in-player playback for non-direct media.
- **Background playback** — Many browsers keep **audio** running across tabs, minimized windows, or other apps. **Media Session** (`hooks/use-media-session.ts`) supplies title, show (`subtitle`), artwork, and play/pause/seek shortcuts where supported (lock screen / media keys vary by OS).
- **Not native** — After **fully closing the browser** (or the OS killing the tab), playback does not continue like a native download app. **Autoplay** may be blocked until a tap/click. **Install/PWA** (manifest, icons) is separate from offline playback; see below.

## Lightweight PWA / installability

- **Manifest** — `app/manifest.ts` (served as `/manifest.webmanifest`): `standalone` display, dark `theme_color` / `background_color`, categories, and PNG icons under **`public/icons/`**.
- **Icons** — Raster icons are generated from `public/brand/icon.svg` via **`npm run build:icons`** (runs automatically as **`prebuild`** before `next build`). Outputs: `icon-192.png`, `icon-512.png`, `maskable-512.png`, `apple-touch-icon.png`, plus **`public/favicon-32.png`**. Source vector: `public/brand/`. **DevDependency:** `sharp` (only for the icon script).
- **What you get** — Polished tab/bookmark metadata, Add to Home Screen / install UI **where the browser supports it** (often Chromium-class browsers over HTTPS with a solid manifest). There is **no service worker** yet—no offline shell, precache, or background sync—so behavior stays predictable for auth, playback, and freshness.
- **Install hint** — A small dismissible strip in **`components/pwa/install-hint.tsx`** (via **`components/site-footer.tsx`**) appears only when the browser fires `beforeinstallprompt` (may be rare without a service worker). It does not interfere with the global player.

## Brand, favicon, and social preview

- **Vector system (`public/brand/`)**  
  - `logo-mark.svg` — icon-only mark (well + sound), header mobile / small contexts.  
  - `logo-wordmark.svg` — mark + “DEEP WELL / AUDIO” (desktop header).  
  - `icon.svg` — **source** for app icons (512 artboard, rounded square).  
  - `favicon-source.svg` — **reference** mark for favicon art (no micro-detail).

- **Tab & platform icons**  
  - `public/favicon.svg` — primary vector tab icon (no `.ico`; some older agents still pick up `favicon-32.png`).  
  - `public/favicon-32.png`, `public/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `maskable-512.png` — generated by **`npm run build:icons`** (runs in **`prebuild`**) from `public/brand/icon.svg` via `sharp`.

- **Metadata wiring (`app/layout.tsx`)**  
  Title template **`%s | Deep Well Audio`**, shared description, `themeColor`, `appleWebApp`, `icons`, Open Graph + Twitter (see below).

- **Manifest / PWA**  
  `app/manifest.ts` → `/manifest.webmanifest` (`standalone`, `#0b1220`, icon sizes + maskable).

- **Social share images**  
  `app/opengraph-image.tsx` and `app/twitter-image.tsx` (edge **`ImageResponse`**) share layout from `app/og-brand.tsx` — default 1200×630 card; per-page titles still come from the metadata template when sub-pages define `title`.
