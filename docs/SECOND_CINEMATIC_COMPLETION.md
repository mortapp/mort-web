# Second cinematic implementation and verification

## Delivered design

The first pass supplied the engine but left the public pages too dark and structurally generic. This pass gives Home, Safety, Legal, Auth and App explicit scene profiles. Public atmosphere is visible through open compositions, with contrast backing placed around reading areas. Important content stays semantic HTML; the environments and interactive ornaments are real Three.js geometry.

Home now combines layered 3D terrain, moving clouds and mist, a wind-deformed silver cloth, distant spires, faceted beacon, orbital arcs, weather, and brighter animated water. Safety is an editorial guarded journey through monumental receding portals, a lit causeway and watch beams. Its emergency notice, six original safety topics and limitations are retained. Local legal pages have glass planes with traveling light and rain; `/privacy` and `/terms` resolve to their existing documents. Auth has quieter distant lights and sheltered forms. App surfaces retain the quiet profile, dimensional material treatment, readable role button labels, focus styles and existing workflows.

The separate `legal.mortapp.org` site is generated in `mortapp/Mort` from `scripts/build-public-legal-site.mjs` and `web/legal-archive/`. Its existing Vercel project is `mort-legal`. The old card overview becomes a living rain/glass archive, with thirteen semantic documents, section navigation, readable policy measures, preserved deletion controls and self-hosted procedural assets. Unrelated work in the user's existing Mort checkout was not touched.

## Interaction and rendering

Rapier continues to integrate spring forces, damping, collisions and drag impulses at a fixed physics step. Low-amplitude wind gives fragments an idle response. Primary drag injects bounded velocity; hover and right button do not. Touch uses horizontal intent in marked scene areas and preserves vertical scrolling. Form controls and links are excluded. Release retains inertia; cancellation and hidden state clear input.

Pause, reduced motion, hidden tabs, context loss and startup without WebGL retain functional DOM content. A paused canvas now redraws once after resize so its drawing buffer is not left blank. Software or degraded rendering uses 0.65 DPR and a 24 FPS cap; normal mobile/quiet profiles cap at 30 FPS, desktop at 60. This is an adaptive upper bound, not a measured hardware FPS guarantee. Browser QA used Windows Chromium with software WebGL.

## Research and visual review

See [the research matrix](SECOND_CINEMATIC_PLAN.md) for all twenty-one requested references/registers, primary production sources, exact original design interpretations, and limitations retrieving the six video links. No anime characters, frames, logos, music or copyrighted art assets are included.

Live before captures covered Home, Safety, Legal, login/signup and privacy/terms on desktop/mobile. Iteration corrected opaque public backing, flat terrain, distant spire shapes, Safety corridor occlusion, legal idle visibility, mobile overflow, quiet form contrast, legal pointer handling, software rendering cost, and paused-resize blanking. Final Home/Safety desktop/mobile and legal hero/reading/deletion/fallback screenshots were inspected. Screenshots and JSON browser results are local ignored QA artifacts, not production assets.

The final local idle A/B test sampled a 450×570 pixel environmental region three seconds apart. A pixel counts only when summed RGB channel change exceeds 20:

| Scene | Changed pixels |
| --- | ---: |
| Home | 26.34% |
| Safety | 14.46% |
| Local legal | 5.61% |

All exceed the 1.2% visibility floor. Paused A/B images are identical. The separate archive also exceeded the same floor (7.72% in its second run). These tests measure observable motion, not subjective art quality.

## Local validation

| Command | Result |
| --- | --- |
| `npm ci` | Clean installation passed |
| `npm test` | 5/5 passed |
| `npm run lint` | Passed, no errors |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; all public and authenticated routes compiled |
| `npm audit` | 0 vulnerabilities |
| `MORT_QA_BASE_URL=http://localhost:3001 npm run test:browser` | 13/13 passed, 2.7 minutes |
| `git diff --check` | Passed |

Browser coverage includes 390, 430, 768, 1024, 1366, 1440, 1920 and 2560 widths; public/auth route overflow and client errors; pointer force reaching Rapier; no hover/right activation; release; pause persistence; keyboard lifecycle selection after reduced-motion remount; real CDP touch gestures and native scrolling; WebGL loss/startup fallback; mobile navigation; and 26 protected route families retaining login redirects. Initial failures were investigated and fixed; the results above describe the final complete run.

Legal archive verification is maintained in its own `web/legal-archive/README.md`, unit tests and browser runner. The generator preserves the legal document bodies and account-deletion script. The public configuration was reconciled against the existing deployed local source and verified via a read-only auth settings request. No credential or service-role secret is added.

## Review and release scope

The intended diff contains only presentation, scene code, regression coverage, public aliases, package metadata and these notes. No auth actions, Supabase policies, database migrations or server authorization logic were changed. A separate read-only implementation review found no concrete blockers; root review also covered the later renderer and legal input fixes.

Both existing `main` branches are the release targets. Commit IDs, push confirmation and production domain verification are recorded in the final release report after deployment. Local test success alone is not a production claim.

## External QA limitation

No usable existing teen, adult, guardian and admin credentials were available in the searched project configuration/documentation. Authenticated live role workflows could therefore not be exercised. They were checked through source/build inspection and unauthenticated route protection tests. No fake production accounts were created and no authentication/RLS bypass was introduced. This follows the user's explicit instruction to finish and ship the remaining work without that access.
