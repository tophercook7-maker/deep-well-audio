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
