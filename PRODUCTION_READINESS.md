# MORT Web Production Readiness

**Reviewed:** 2026-11-08
**Workspace:** `Downloads\mort-web`
**Production Supabase project:** `jxbnrkasktbhtiujkhay`
**Production deployment:** Not changed during this review

Statuses describe evidence available in this workspace. A passing local build is not evidence that Supabase RLS, provider settings, or production behavior have been verified.

| Step | Status | Evidence and remaining work |
|---|---|---|
| 1. Resolve website PR #15 | COMPLETE | Reviewed the complete PR diff and history. PR #15 is open and its required CI validation passed. Local lint, type-check, tests, and production build passed on the PR branch. The five prior lint errors are addressed by the PR. It is prepared for review; it was not merged. |
| 2. Teen dashboard isolation | BLOCKED | Role layouts and server actions use role checks and backend RPCs for key marketplace writes. No authorized teen test account or production RLS/RPC access was available to test cross-account or URL-ID isolation. |
| 3. Adult dashboard isolation | BLOCKED | Adult writes call job/application RPCs and the UI gates job posting on verification. Live ownership enforcement, RLS behavior, and unauthorized-ID tests remain unverified. |
| 4. Guardian dashboard isolation | BLOCKED | Guardian pages filter to the current guardian and active connections in application code. Active/revoked/expired relationship enforcement must be confirmed by production RLS/RPC tests with authorized accounts. |
| 5. Admin authorization | BLOCKED | Admin pages/actions are guarded by `requireRole(['admin'])`; account/report actions use admin RPCs. The legacy business-verification review action directly updates a profile and is documented in code as closed-testing-only. Production staff authorization, audit trails, and backend policy enforcement are not verified. |
| 6. Authentication and lifecycle | IN PROGRESS | Code-level review covered signup, password login/reset, Google OAuth, callback handling, and safe redirects. Same-origin redirect validation and removal of DOB from OAuth callback URLs were implemented with regression tests. Signup confirmation, recovery, OAuth, revocation, and restricted-account flows were not live-tested. |
| 7. Email and notifications | BLOCKED | Signup confirmation and password recovery use Supabase Auth email APIs. No Resend application integration was found in the website source. Supabase SMTP settings, sender identity, and actual delivery were not accessible for verification. |
| 8. Design, accessibility, responsive QA | BLOCKED | The production build passed. No real-browser or device QA was completed: Kane CLI authentication had expired, and no authorized browser session was available. Keyboard, contrast, screen-reader, reduced-motion, and viewport checks remain open. |
| 9. Marketplace workflows | BLOCKED | Public pre-launch copy states that marketplace access is unavailable. Important web writes use RPCs, but job/application/messaging/safety workflows were not exercised against the production backend. Public activation remains unapproved. |
| 10. Legal, privacy, and safety | IN PROGRESS | Legal publication version/hash verification passed for all four bundled documents. Approval status, live consent recording, production link destinations, and analytics/storage behavior require owner and production review. |
| 11. Security, privacy, and performance | IN PROGRESS | Next.js was updated to 16.4.5; `npm audit --omit=dev` reports zero production vulnerabilities. Same-origin redirects and DOB handling were hardened. Eight moderate development-tool advisories remain; backend authorization, production headers, abuse controls, and privacy behavior require live verification. |
| 12. Deployment and launch preparation | BLOCKED | Read-only HEAD checks returned 200 for `mortapp.org` and `mort-web.vercel.app`, and 308 from `www.mortapp.org` to the canonical domain. No Vercel/Supabase dashboard access was available; environment scopes, callbacks, authenticated routes, deployment commit, and rollback were not verified. No settings changed and no deployment was performed. |

## Local validation

- `npm run lint` — passed on the PR #15-based hardening branch.
- `npm run typecheck` — passed.
- `npm run build` — passed, including prebuild tests and legal publication verification.
- `npm audit --omit=dev` — zero vulnerabilities.
- `npm audit` — eight moderate development-dependency advisories remain.
- Kane browser QA — not run; the configured CLI account was expired and unauthenticated.

## Release decision

**MORT Web is not verified production-ready.** Steps 2–5, 7–9, and 12 require authorized provider/backend access or human approval. Do not enable marketplace publishing, document collection, payments, or Stripe as part of this work.

## Evidence links

- [Website PR #15](https://github.com/mortapp/mort-web/pull/15) — open; not merged.
- [PR #15 validation run](https://github.com/mortapp/mort-web/actions/runs/42214503370/job/127881027524) — passed.
- [Production website](https://mortapp.org) and [Vercel domain](https://mort-web.vercel.app) — read-only HEAD checks returned 200; `www.mortapp.org` redirects to the canonical production domain.
- Local test details: [role isolation results](./ROLE_ISOLATION_TESTS.md), [security audit](./WEB_SECURITY_AUDIT.md), and [release acceptance](./WEB_RELEASE_ACCEPTANCE.md).
