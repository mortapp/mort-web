# MORT Web Security Audit

**Reviewed:** 2026-11-08
**Scope:** Local source, dependency tree, build-time checks, and repository documentation. No production credentials were accessed and no production data was queried.

## Findings and remediation

| ID | Severity | Status | Finding | Evidence / remediation |
|---|---|---|---|---|
| SEC-01 | CRITICAL | FIXED | The installed Next.js version was 16.3.5, within the affected range reported by `npm audit` for multiple Next.js advisories, including unauthenticated/RCE and cache/data-disclosure issues. | Pinned `next` and `eslint-config-next` to 16.4.5. `npm audit --omit=dev` now reports zero vulnerabilities; production build and type-check pass. |
| SEC-02 | HIGH | FIXED | Google signup placed date of birth in the OAuth callback query string, exposing it to browser history and URL-based logging/referrer surfaces. | DOB now travels in a five-minute, HttpOnly, SameSite=Lax cookie scoped to `/auth/callback`; Secure is enabled in production. A random nonce binds the cookie to the callback, and callback responses clear it. Regression tests cover state validation and prohibit DOB query parameters. |
| SEC-03 | MEDIUM | FIXED | `safeNext` accepted values beginning with `/` unless they began with `//`; backslash URL normalization could bypass that check. | Redirect destinations now reject backslashes, whitespace/control characters, parse against a fixed origin, and require the parsed origin to remain same-origin. Tests cover external, protocol-relative, backslash, and malformed inputs. |
| SEC-04 | MEDIUM | OPEN / ACCEPTED TEMPORARILY | Eight moderate advisories remain in development-only lint dependencies through the `typescript-eslint` → `minimatch` chain. | `npm audit --omit=dev` is clean. `npm audit fix --force` proposes downgrading `eslint-config-next` to 15.5.29, which is an incompatible major-version change for this Next 16 app; it was not applied. Re-evaluate when a compatible upstream fix is available. |
| SEC-05 | HIGH RELEASE GATE | UNVERIFIED | Role isolation depends on production Supabase RLS and RPC authorization. Local role checks do not prove that the backend rejects cross-user IDs or revoked guardian relationships. | No authorized production database access or role test accounts were available. Do not treat the role-isolation checklist as passed until the backend owner supplies current schema/policy evidence and controlled test accounts. |
| SEC-06 | HIGH RELEASE GATE | UNVERIFIED | Admin business-verification review currently updates `profiles.verification_status` directly. The action is explicitly labeled closed-testing-only in code and is not equivalent to a production verification workflow. | Keep adult job posting and public marketplace activation disabled until the backend contract and audit trail are approved. Do not add a service-role key or weaken RLS to make this path work. |

## Additional review notes

- The website uses Supabase Auth for signup and password recovery. No Resend API integration was found in the inspected website source; provider SMTP delivery remains unverified.
- Core job, application, proof, messaging, support, and admin operations use RPCs in the inspected call sites. Backend ownership checks and `SECURITY DEFINER` properties were not independently verified against the current production project.
- Historical Supabase reports in this repository were based on a deleted project. They are marked as historical and are not production evidence.
- No production environment-variable values, secrets, or service-role credentials were read or changed.

## Verification commands

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed.
- `npm audit --omit=dev` — zero vulnerabilities.
- `npm audit` — eight moderate development-only advisories remain.
