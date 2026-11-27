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

## Follow-up: onboarding re-entry from the dashboard gate

Mode: Redesign · Preserve (focused extension). Preserve MORT's ink/silver identity, the existing page hierarchy, server-authoritative active step, four onboarding actions, legal clickwrap, verification notices, and account-review gate. Improve the signed-in return path by replacing only the exact dashboard-gate message (`Finish setting up your MORT account to continue.`) with a persistent checkpoint panel that names the actual next step and links directly to the current step heading. Keep all other success/error messages on the existing toast behavior. Remove the transient, auto-dismissing version of this one guard message; do not invent progress or claim marketplace activation. Highest risk: stale or unavailable RPC progress; show the persistent panel only when the progress contract is `ok`, and keep the existing fallback warning otherwise. Rollback: remove the conditional panel and restore the guard message to the generic toast.

## Follow-up — choose a signup path before account details

Mode: Redesign · Preserve (bounded signup extension). Preserve the MORT monochrome auth shell, current destinations, email and Google signup actions, terms/privacy copy, existing role values (`teen`, `adult`, `guardian`), and server-side age/role protections. Improve decision clarity by replacing the low-visibility role dropdown with three prominent selectable paths before the signup details. The teen path states that a verified school email address on an approved school domain is required to continue teen onboarding. Explain beside the choices that date of birth is authoritative: users under 13 cannot register; ages 13–17 enter as teens; adults choose an adult or guardian path. Keep the existing DOB field and validation in the signup form and keep Google signup's DOB check intact.

Project structure: `app/(auth)/signup/page.tsx` owns the visible role choices and form; `app/(auth)/actions.ts` remains the source of age-derived role and eligibility; `app/globals.css` adds scoped, keyboard-visible, responsive role-choice styles; `scripts/onboarding-v2-contract.test.mjs` records the new pre-signup disclosure and the protected age/role contracts.

Design Read: conversion-focused signup choice for teens, adults, and guardians; existing-product preserve mode; editorial black/silver MORT language; visual variance 4/10, motion 2/10, information density 5/10, asset dependence 1/10, brand fidelity 10/10. Four positioning checks: this is the first decision on the signup panel; viewed at phone/laptop distance; calm and explicit rather than promotional; all three choices plus the school-email condition must fit without hiding DOB or the email flow. Use existing 4px spacing multiples, current Plus Jakarta Sans/body system, existing ink/silver colors, thin borders, 9px controls, and brief border/fill feedback only.

Highest-risk change: users may mistake their selected card for age eligibility. Mitigation: state that DOB decides the age band, retain the HTML minimum-age date limit and server-side age check, and preserve adult role sanitization. Rollback: restore the current role dropdown at its original location and remove the scoped path-card styles, without changing server actions.
