# MORT Web Release Acceptance

**Reviewed:** 2026-11-08
**Decision:** NOT READY FOR PRODUCTION RELEASE

| Area | Status | Evidence / remaining acceptance criteria |
|---|---|---|
| Lint, type safety, production build | PASS | `npm run lint`, `npm run typecheck`, and `npm run build` passed on the PR #15-based hardening branch. |
| Build regression tests | PASS | Pre-launch copy, CSP origin, legal publication, onboarding contract, safe redirect, and OAuth signup-state tests passed. |
| Production dependencies | PASS | Next.js is pinned to 16.4.5. `npm audit --omit=dev` reported zero vulnerabilities. |
| Development dependencies | NEEDS REVIEW | Eight moderate `minimatch`-chain advisories remain in development tooling. The available forced fix downgrades the Next lint configuration and was not applied. |
| Authentication | NOT TESTED LIVE | Signup, email confirmation, Google OAuth, reset-password, expired/revoked sessions, and restricted accounts require authorized provider test accounts. |
| Email delivery | NOT TESTED LIVE | Supabase Auth SMTP settings, sender identity, and actual signup/recovery delivery were not accessible. |
| Teen/Adult/Guardian/Admin isolation | NOT TESTED LIVE | Backend RLS, RPC authorization, cross-account ID changes, and guardian-consent lifecycle need controlled role accounts and backend-owner confirmation. |
| Marketplace workflow | NOT TESTED LIVE | Discovery, posting, applications, status transitions, messaging, reports, proof, and safety paths remain disabled or unverified against production. |
| Responsive UI | NOT TESTED | No mobile/tablet/desktop browser run was completed. Kane CLI authentication was expired. |
| Accessibility | NOT TESTED | Keyboard traversal, visible focus, contrast, screen-reader labels, reduced-motion, and form validation require browser/device testing. |
| Legal and consent | PARTIAL | Bundled legal version/hash verifier passed. Legal approval, deployed links, and live consent recording were not independently confirmed. |
| Domain, redirects, production settings | PARTIAL | Read-only HEAD checks returned 200 for `mortapp.org` and `mort-web.vercel.app`, and 308 from `www.mortapp.org` to `https://mortapp.org/`. Callback allowlists and Vercel variable scopes need authorized dashboard inspection. |
| Deployment and rollback | NOT PERFORMED | No deployment, production configuration change, or rollback test was performed. |
| Human/provider approvals | REQUIRED | Backend owner must confirm production RPC/RLS contracts; product/legal owners must approve legal and verification flows; launch owner must explicitly authorize deployment and any public activation. |

Public marketplace publishing, identity-document collection, payments, and Stripe must remain disabled until their separate approvals and gates are complete.
