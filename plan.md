# MORT Auth Flow Improvement — Plan

## Scope and implementation

Ship one conversion-focused change: when an unauthenticated visitor opens a protected `/app` route, preserve that in-app destination through the login/signup handoff and make the next steps visible as a compact MORT journey rail. Signup explains account creation → onboarding → review-gated access. Login specifically returning to onboarding highlights sign-in → resume setup → review-gated access. The Supabase proxy will forward the original app path to server components using a request-only header; the auth guard will validate that it is a same-site `/app` path before placing it in `next`. Login/signup already preserve safe `/app` destinations through email and Google OAuth, so those handlers remain the source of truth.

Add a compact, accessible “Next step” cue to the auth shell only for the onboarding return case. Preserve the existing MORT black/silver identity and real `Logomark`; avoid inventing new imagery. Keep all signup field names/order, DOB age gate, role choices, Google and email actions, legal copy, onboarding RPCs/steps, account-review disclosure, and dashboard authorization unchanged.

## Project structure

- `proxy.ts` / `lib/supabase/proxy.ts`: forward the original protected path to downstream server components alongside the existing Supabase session-cookie refresh.
- `lib/auth.ts`: derive and validate a same-site `/app` return path; redirect unauthenticated visitors to `/login` with that `next` value.
- `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, and `components/auth-shell.tsx`: show the guided journey and a focused continuation cue for onboarding without changing form contracts.
- `globals.css`: scoped responsive and focus-visible styling for that cue.
- `scripts/onboarding-v2-contract.test.mjs`: assert that the route handoff and protected onboarding contracts stay intact.

## Design record

Mode: Redesign · Preserve.
Preserve: MORT's editorial black/silver auth identity, existing brand mark, authentication providers, route gates, all form contracts and legal content.
Improve: continuity between protected app entry and authentication; clarity about the immediate post-login destination.
Remove: the generic “Sign in first” dead-end feeling when a visitor was specifically trying to continue onboarding.
Protected contracts: signup inputs and order, server actions, DOB minimum age 13, role sanitization, OAuth state, onboarding's four steps/legal clickwrap, dashboard access gate, existing routes.

Design Read: browser auth-flow continuation for MORT's teen workers, adults and guardians; existing-product preserve mode; visual language is high-contrast editorial MORT black/silver; variance 4/10, motion 2/10, information density 4/10, asset dependence 2/10, brand fidelity 9/10. The low-motion cue is concise and responsive; it does not add a blocking interstitial or new account step.

Highest-risk change: request path propagation across Supabase cookie refresh. Keep the existing response/cookie behavior and forward only the original same-origin `/app` path. Fallback: remove the new request header and cue to restore the prior generic auth redirect, without changing auth or database behavior.

## Verification and delivery

Run typecheck, lint, production-config tests, and build; commit the scoped change and push to `origin/main` without force-pushing. Verify the resulting production deployment before reporting it as live.
