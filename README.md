# MORT web

Next.js App Router application for local teen work, adult job posting, and guardian oversight. Uses the existing Supabase project and its authorization, RPC, and storage rules.

## Local development

1. Install Node.js 22 or newer and run `npm ci`.
2. Copy `.env.local.example` to `.env.local` and fill in the existing project's publishable configuration. Never use a service-role key. Set `NEXT_PUBLIC_SITE_URL` to your local URL for local testing.
3. Run `npm run dev`.

## Verification

- `npm test`: isolated input-state regression tests.
- `npm run lint`: ESLint.
- `npm run typecheck`: TypeScript.
- `npm run build`: production build.
- `npm audit`: dependency advisory check.
- `npx playwright install chromium`, then start production with `npm run start` and run `npm run test:browser` in another terminal. Browser tests use localhost:3000. Screenshots/traces stay in ignored QA folders. They never create accounts or submit production forms.

## Visual architecture

`components/mort-atmosphere.tsx` owns lazy loading, reduced motion, pause persistence, and WebGL fallback. The global world lives in `components/mort/scene`: procedural water and terrain, a silver beacon, batched point particles, a ribbon, and a small Rapier spring/impulse simulation. The voyage mounts a separate on-demand renderer only while visible. Shared material tokens live in `app/cinematic.css`, with existing layout primitives in `app/globals.css` and reusable SVG icons in `components/mort/icon.tsx`.

The atmosphere is decorative. All meaningful controls and states remain in the DOM. Mouse dragging requires the primary button. Touch zones preserve vertical page scrolling. Pause and reduced motion retain a static composition.

## Safety boundaries

Do not weaken authentication, role checks, RLS, verification gates, storage restrictions, or deliberately disabled payment preferences. See the existing audit and deployment documents for backend limitations and closed-testing procedures. Live role-based QA requires existing test accounts; source inspection and redirect tests do not substitute for authenticated end-to-end testing.

The old root-level upload copies were never imported by App Router; they were removed to eliminate duplicate source and a broken TypeScript input. Their originals remain in Git history at `283de46`.

See `docs/ASTRA_3D_REVAMP_COMPLETION.md` for exact validation evidence and limitations.
