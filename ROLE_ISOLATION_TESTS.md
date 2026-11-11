# MORT Web Role Isolation Test Results

**Reviewed:** 2026-11-08
**Result:** Local code-contract checks passed; live isolation is not verified.

| Role | Local evidence | Status | Required live verification |
|---|---|---|---|
| Teen | Role layout requires `requireRole(['teen'])`; teen application and proof actions use the signed-in user and backend RPCs. Existing onboarding contract tests check active-account gating. | BLOCKED | Use two authorized teen accounts to test profile, job, application, message, notification, and safety-record isolation. Mutate record IDs and URLs; confirm server/RLS denial and no data in responses, logs, or browser storage. |
| Adult | Adult layout requires `requireRole(['adult'])`; job creation/status and application decisions call backend RPCs. Job posting is gated on approved verification status. | BLOCKED | Use two adult accounts to test job ownership, applications, account data, and all ID/URL mutations. Confirm every backend operation checks ownership and rejects unauthorized requests. |
| Guardian | Guardian layout requires `requireRole(['guardian'])`; page queries constrain connections to the current guardian; actions check active connections before actions. | BLOCKED | Test consented, pending, revoked, expired, absent, and suspended relationships across two guardians. Confirm RLS/RPC rejection after relationship revocation and no access to adult-private or admin data. |
| Admin | Admin layout/actions require `requireRole(['admin'])`; account and report changes call admin RPCs. Business verification remains a closed-testing-only direct profile update. | BLOCKED | Verify staff identity comes from a trusted backend claim, not editable profile fields. Test ordinary-user denial for admin pages/RPCs, least-privilege queries, and audit records for every sensitive action. |

## Automated checks run locally

- `scripts/onboarding-v2-contract.test.mjs` passed. It checks role-protected layouts, account/onboarding gates, and expected onboarding RPC usage.
- `scripts/google-signup-state.test.mjs` passed. It checks OAuth DOB state, nonce matching, and absence of DOB in callback query handling.
- `scripts/site-url.test.mjs` passed. It checks same-origin redirect handling.
- `npm run lint`, `npm run typecheck`, and `npm run build` passed on the PR #15-based hardening branch.

These are source/build checks, not impersonation or live RLS tests. No production database, test accounts, or browser sessions were used.
