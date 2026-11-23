# MORT website (Next.js)

Next.js 15 App Router + TypeScript. No database, no auth, no env vars required.

## Routes
- `/` – the redesigned home page (phone Apply demo, hold-for-help, address-privacy stages, post-a-job demo, role switcher)
- `/legal/terms` – Terms preview page (see "Before you go public")

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Deploy (Vercel)
1. Push this folder to a **new** GitHub repo (or `vercel` from this folder).
2. Import it as a **new** Vercel project. Framework preset: Next.js, defaults are fine.
3. Do **not** point this at the existing `mort-web` project/repo root. That app owns login, verification,
   admin activation and Supabase. Overwriting it breaks them.
4. Check the preview URL, then attach your domain / rewrites when ready.

## Before you go public
- The site ships **noindex**. Set `NEXT_PUBLIC_INDEXABLE=true` in Vercel only after review.
- `lib/legal.ts` holds the Terms version line ("MORT-LEGAL-2026-V5, effective Nov 10, 2026") and the
  "does not currently process real-world Task payments" line. Neither is confirmed against the
  counsel-approved build (Vercel only shows V3). Confirm or edit them there.
- Terms sections 1-16 are stubs linking to the full text. The real text must come from the
  counsel-approved source in the Mort repo; do not hand-copy it here.
- In production, `/legal/*` is served by the `mort-legal` project. If this site shares a domain with it,
  keep `/legal/*` pointed at `mort-legal` and drop the `/legal/terms` route here.
- Sign in / Get started / Privacy / Safety links are absolute `https://mortapp.org/...`.
- The public page intentionally omits the $2.97 fee and payout claims.

## Differences from the original HTML
- Same design and copy, rebuilt as React components; CSS is carried over unchanged except:
  `font:` shorthands were already fixed; `.pay` spacing is now scoped to the post sheet so it no longer shifts the phone card price.
- Font loads through `next/font` (self-hosted at build) instead of a Google Fonts `<link>`.
