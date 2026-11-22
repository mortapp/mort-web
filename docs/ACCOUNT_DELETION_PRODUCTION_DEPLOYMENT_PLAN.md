# Public account-deletion production deployment plan

**Status:** Prepared only. PR #39 remains open; no merge, Vercel production deployment, or production configuration change was performed.

**PR:** [mortapp/Mort PR #39](https://github.com/mortapp/Mort/pull/39)

**Branch:** `hardening/public-account-deletion-20261122`

## Current deployment finding

The public `/account-deletion` route and its confirmation/status actions are implemented and passed local production-config tests, legal verification, Next.js build, and HTTP smoke testing. The deployed route currently returns HTTP 404 because this PR branch's `vercel.json` sets `deploymentEnabled` to `false`; the production host is serving the pre-PR `main` deployment.

## Required review before merge

1. Review the complete PR #39 diff, including `app/account-deletion/page.tsx`, server actions, confirmation route, legal copy, metadata, and `vercel.json`.
2. Confirm the route does not expose account existence, request identifiers, private status data, or secrets to unauthenticated callers.
3. Confirm same-browser confirmation, expiry, rate limits, CSRF/origin handling, and failure responses against the current backend contracts.
4. Require green website CI, production build, legal verification, and route smoke checks on the merge candidate.
5. Obtain explicit owner authorization to merge. This document does not grant merge authorization.

## Prepared merge/deploy sequence

When separately approved, use the repository's normal protected-branch merge process for PR #39. Do not manually deploy the PR branch while `deploymentEnabled` is false. After merge to `main`, allow the normal Vercel production integration to build the merged commit.

The release record should capture the merged commit, Vercel deployment ID, build logs, environment target, and approver. Do not change production Supabase secrets or database schema as part of the website route deployment.

## Non-destructive post-deployment verification

Verify the production URL with an HTTP client and browser-level smoke test:

- `GET /account-deletion` returns HTTP 200 and the expected canonical metadata.
- The page contains only public instructions and never renders a user-specific deletion status without a valid same-browser flow.
- Invalid, expired, reused, and cross-origin confirmation attempts fail closed without revealing whether an account exists.
- The legal/privacy links resolve to the approved current documents.
- No account deletion is submitted during the production smoke test.

Record HTTP status, response headers relevant to caching/security, deployment ID, route URL, timestamp, and redacted screenshots or logs. Do not include real user emails or request identifiers.

## Rollback

If the route fails build, leaks account-existence information, or violates the approved legal copy, stop promotion and roll back through the Vercel deployment history or protected `main` revert process. Record the prior deployment ID, reverted commit, approver, reason, and post-rollback HTTP result. Do not “fix” a production issue by enabling the PR branch or changing production secrets ad hoc.

## Current evidence and blocker

Local tests, build, and HTTP smoke evidence are recorded in the consolidated readiness report. The deployed 404 is an identified deployment-drift issue, not proof that the route is production live. Merge authorization and the production Vercel deployment remain external approvals; production is untouched.
