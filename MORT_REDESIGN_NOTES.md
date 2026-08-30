# MORT — visual identity integration

This is your existing Next.js + Supabase app, re-skinned into the MORT "calm night / voyage"
identity (black · silver · white · midnight blue). **No server logic, routes, RLS, RPCs, auth
or data flow were changed** — the redesign is a visual layer that rides on top of your existing
design-system tokens.

## What changed

**Theme (one place, whole app):** `app/globals.css`
- Re-pointed the color tokens: rose-gold / pink → **luminous silver-white primary** + **ice/midnight
  blue accents**. Because every route reads these CSS variables, all ~40 routes re-skinned at once.
- `--primary`, `--primary-gradient`, `--primary-tint-bg`, `--accent-blue`, `--accent-pink`, the
  elevation greys (`--el-1..3`), `--bg`, and text greys are now cool instead of warm. Red stays
  reserved for danger/SOS; small success greens are unchanged.
- `body` is transparent and `html` holds the base color so the atmosphere shows behind content.
- Removed two missing decorative background images (`/manus-storage/*.jpg`) that were 404ing.
- Appended a small **MORT voyage identity** block (wordmark, typed caret, atmosphere canvas styles).

**New components**
- `components/mort-atmosphere.tsx` — the fjord/voyage canvas. Fixed behind everything, **auto-dims
  inside `/app`** (via `usePathname`) so the dashboard stays legible. Respects reduced-motion.
- `components/logomark.tsx` — the MORT mark (a guiding star over a wave = the safe crossing).
- `components/mort-hero.tsx` — the homepage wordmark that writes itself on, with a typing tagline
  ("Earn nearby." / "Move smart." / "Build real experience.").

**Small edits**
- `app/layout.tsx` — mounts `<MortAtmosphere/>`, updates `<title>`/description, favicon → `/mort-mark.svg`.
- `components/site-header.tsx` — the "M" tile → the real `<Logomark/>`.
- `app/page.tsx` — hero copy block → `<MortHero/>`.
- `public/mort-mark.svg` — new favicon / app mark.

## Run it

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase publishable key
npm run dev        # or: npm run build && npm run start
```

Verified: `npm run build` compiles all routes and `next start` renders home, /login, /signup and
/safety with zero console errors.

## Notes & next steps
- The atmosphere is deliberately **restrained inside `/app`** (dimmed) and full-strength on the
  public/marketing/auth surfaces — matching the brand doc ("MORT settles into the interface").
- Want the warm coral accent from an earlier mockup instead of silver? It's a one-line swap:
  set `--primary-gradient` / `--primary` / `.btn.primary` color in `app/globals.css`.
- Not touched this pass (already functional in your app, and a separate privileged surface):
  moderator / support / admin portals. Their look now inherits the new tokens automatically.
- A standalone clickable design prototype of the public site + onboarding was also produced in the
  conversation for reference; this repo is the deployable source of truth.

## Follow-up pass (identity polish)
- **Logomark everywhere:** the auth brand panel (`components/auth-shell.tsx`) and the app sidebar
  (`components/app-shell.tsx`) now use the real `<Logomark/>` instead of the "M" tile.
- **Brighter marketing atmosphere:** lightened/cooled the hero overlay and vignette and lifted the
  dawn/star brightness in `components/mort-atmosphere.tsx`, so the voyage (ship, horizon light)
  reads clearly behind the public pages while hero text stays legible.
- **Themed the app + auth chrome:** the sidebar, top bars (public + app) and the auth panels are now
  translucent with a blur, so the *dimmed* voyage shows subtly behind the interface — `/app` feels
  part of the same world as the landing, without competing with the content. The auth form panel keeps
  a solid backing for legibility; the brand panel shows the night.

## Creative pass (immersive homepage)
- Rebuilt `app/page.tsx` from a generic split-hero + card walls into an **immersive night**:
  a full-viewport centered hero over the voyage (animated wordmark + typing tagline), then a
  signature **"The crossing"** section — `components/mort-voyage.tsx` draws the job lifecycle
  (Discover → Apply → Accepted → Scheduled → In progress → Completed) as a track with a ship that
  slowly sails it — followed by editorial Move/Trust/Safety, live categories, roles, and safety.
- Dropped the speculative XP-levels / badges / "trust score" wall (conflicted with the doc's
  "don't fake a trust score"); the mature "local opportunity infrastructure" framing leads instead.
- New styles live in the identity block at the bottom of `app/globals.css` (`.mort-hero-section`,
  `.mort-crossing`, `.mort-steps`, `mortSail` keyframe).
