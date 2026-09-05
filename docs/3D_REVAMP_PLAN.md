# MORT cinematic world — implementation plan

## Approved direction
Implement the supplied completion brief on the existing application. The September 5 ZIP matches GitHub commit `283de46` after newline normalization. Work is in a dedicated clone. No route, server action, database schema, authorization, or payment behavior will be replaced.

Use React Three Fiber with procedural Three.js geometry and shaders, and Rapier for a small suspended silver-fragment simulation. A single lazy global Canvas is shared by routes; the voyage mounts its own visibility-gated, on-demand renderer. Public chapters influence camera depth without scroll interception. App/auth routes use a quiet environment. DOM content always owns reading, focus, forms, and status.

Compared approaches: extending Canvas 2D cannot meet real scene depth; direct Three.js adds lifecycle plumbing; Fiber with small isolated systems offers disposal, composition, and Rapier integration. No postprocessing pipeline or downloaded models are needed. Motion is used for controlled hero composition; CSS handles tactile controls.

## Work and verification
- [x] Input: `components/mort/scene/input/drag-state.ts` and `use-scene-input.ts`. Unit tests first for button filtering, velocity, release decay, cancel, and bounded integration. Ignore actionable/text regions, preserve touch vertical pan; dedicated touch zones use horizontal intent and pointer capture.
- [x] World: `components/mort-atmosphere.tsx` owns client loading, fallback, user pause, reduced motion, and visibility. `world.tsx` owns renderer and adaptive quality. Separate water shader, terrain, particles, sculpture, and physics components. DPR <= 1.5, fewer bodies/particles on mobile, no rendering hidden or paused.
- [x] Public: rebuild `app/page.tsx`, hero and voyage with original silver/obsidian art direction, accessible lifecycle buttons and descriptions, genuine category counts, editorial role/safety sections. Fix header anchor.
- [x] Product: shared tokens/materials and SVG icons in `components/ui.tsx`, app/auth shell; all route families retain their existing data and actions. Review page sources and remove decorative emoji presentation. Improve mobile navigation, focus, overflow, forms, tables, loading and messages.
- [x] QA: unit tests, lint, TypeScript, production build, audit. Browser test 390/430/768/1024/1366/1440/1920 and ultrawide. Verify real drag, hover/right-button exclusion, decay, controls, touch horizontal gesture/vertical scroll, pause/reduced-motion/context loss, resize, public/auth routes, and protected-route redirects. Authenticated workflow testing requires existing test access; do not fabricate data or bypass auth.
- [x] Finish: completion evidence and research report, full diff and secrets review, final checks, commit and normal non-force push to `mortapp/mort-web` (PR only if protection requires it).

## Research
All six unique supplied YouTube references were opened. Five exposed titles only; `QUI6Ug4cHnE` could not be retrieved. No claim of watching unavailable video/transcripts. Useful brief principles: deliberate composition, environmental scale, negative space, controlled motion, original geometry, iterative visual QA.

- https://r3f.docs.pmnd.rs/advanced/scaling-performance — adaptive DPR and reuse.
- https://r3f.docs.pmnd.rs/advanced/pitfalls — refs inside frame loops.
- https://pmndrs.github.io/react-three-rapier/ — v2/Fiber 9/React 19, impulses, damping, fixed stepping.
- https://threejs.org/docs/ — procedural geometry, shaders and disposal.
- https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events — capture, cancellation, primary buttons and touch-action.
- https://nextjs.org/docs/app/guides/lazy-loading — client-only lazy scene boundary.
- https://motion.dev/docs/react-accessibility — reduced motion.

No supplied Bleach image was present; no anime assets will be shipped.
