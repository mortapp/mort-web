# MORT cinematic 3D revamp — completion evidence

Validated September 5, 2026 against a production Next.js build on Windows. Starting ZIP matched repository commit `283de46` after newline normalization.

## Delivered

- Original procedural Three.js world: layered mountain ridges, crescent, displaced reflective water, chrome beacon, particles and velocity-driven ribbon. No copyrighted anime artwork or remote model dependencies.
- Rapier rigid bodies with hull colliders, fixed stepping, restoring forces, damping, pointer impulses and torque. Actual body displacement is asserted in browser QA.
- Primary-button drag only; velocity-dependent response and release decay. Interactive DOM elements are excluded. Touch horizontal intent enables the scene while vertical gestures retain native scrolling; capture/cancel/blur/visibility cleanup is implemented.
- Lazy global renderer, DPR ceiling 1.5, reduced mobile geometry, explicit 30 FPS mobile/quiet budget, 60 FPS desktop ceiling, hidden/pause suspension, persistent user pause, reduced-motion composition and WebGL startup/context-loss fallback. Actual device performance varies; these are budgets, not a guaranteed hardware benchmark.
- Visibility-gated on-demand 3D voyage with accessible DOM lifecycle controls, keyboard selection, persistent selection and descriptions.
- Obsidian/silver shared design tokens, responsive editorial landing page, quiet authenticated background, SVG icon system, tactile controls, mobile navigation focus management, skip links, status semantics, table overflow and loading/error treatments.

## Route coverage

Public homepage, safety, privacy and terms were restyled and browser checked. Login, signup, reset-password and update-password use the refreshed auth shell and were checked at desktop/mobile widths. Auth error presentation was updated; callback/confirm/signout behavior is unchanged.

All authenticated routes inherit the refreshed AppShell and shared primitives: dashboard; teen job browse/detail/saved/applications/active/earnings; adult dashboard/jobs/detail/posting/applications; guardian; admin; messages/detail; onboarding; profile; verification; payments; safety/reporting; support/detail; challenges; team hustles. Individual page icons and presentation were updated where needed. Source/build review covers these families, and 26 protected route paths were verified to redirect anonymous requests to login. This does not constitute live authenticated workflow QA.

No server action, library authorization implementation, database schema, RLS rule, payment logic or storage policy was changed. Duplicate unimported upload copies were removed, including a broken root TypeScript input; originals remain in Git history.

## Final checks

| Command | Result |
| --- | --- |
| `npm ci` | Pass: clean lockfile install, 421 packages added |
| `npm test` | Pass: 4 input-state tests |
| `npm run lint` | Pass, no ESLint errors |
| `npm run typecheck` | Pass |
| `npm run build` | Pass, all App Router routes compiled |
| `npm audit` | Pass: 0 vulnerabilities reported |
| `npm run test:browser` | Pass: 9 Chromium browser tests, 1.1 minutes |
| `git -c core.whitespace=cr-at-eol diff --check` | Pass |

Browser suite covered 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1440×900, 1920×1080 and 2560×1080. Public/auth route widths were also checked at 390 and 1440. Checks include horizontal overflow, client exceptions, real mouse drag/physics displacement, hover/right-button exclusion, inertia decay, actionable-element exclusion, pause persistence, reduced motion, voyage remount/keyboard controls, CDP touch gestures and vertical scrolling, WebGL loss, disabled WebGL startup, skip-link focus, mobile navigation and the quiet frame budget. Screenshots were inspected at mobile and desktop sizes. QA uses Chromium software rendering and emulated touch; no claim of physical iPhone/Safari testing is made.

Three focused independent reviews were performed. Findings concerning voyage selection persistence, SVG pointer targets, and Rapier bypassing demand-render frame limiting were fixed and regression checked. Upstream Three/Rapier deprecation and software GPU warnings were observed during manual inspection; final public-route tests reported no client exceptions.

Screenshots, browser traces/results, build output and `.env.local` remain ignored local artifacts. The environment contains only the existing project's publishable client configuration, never a service-role key. Intended changes were reviewed for secrets before commit.

## External limitations

No usable teen, adult, guardian or admin QA credentials/test-account instructions were found in the scoped repository, extracted source or local configuration search. Live authenticated role workflows therefore could not be exercised. As instructed, this did not block finishing and pushing; no users were fabricated and authentication/RLS was not weakened.

The supplied research videos were attempted, but accessible metadata is not equivalent to viewing transcripts. Five titles were available; one reference could not be retrieved. Official implementation references and the precise limitation are recorded in `3D_REVAMP_PLAN.md`. No Bleach reference image was attached.

GitHub push is the requested delivery step. A successful push does not itself verify a downstream hosting deployment; the final conversation reports the resulting commit and remote verification.
