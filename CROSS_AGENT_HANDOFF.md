# MORT Web ↔ Codex Desktop Handoff

**Prepared:** 2026-11-08
**Coordination status:** No shared database contract was changed in this web workspace. Current production backend behavior remains unverified here.

## Web backend contract surface

Names below were found in current web source/tests. Their signatures, ownership rules, and current production availability must be confirmed by the backend owner before relying on them.

- **Profile and onboarding:** `ensure_my_profile`, `save_my_initial_dob_v1`, `get_my_onboarding_progress_v2`, `get_my_legal_requirements`, `get_my_verification_requirements_v1`, `save_my_onboarding_account_v2`, `save_my_onboarding_work_v2`, `save_my_onboarding_safety_v2`, `complete_my_onboarding_v2`, `submit_legal_acceptance`, `update_my_profile`.
- **Jobs and applications:** `save_job_draft_or_publish`, `manage_job_v2`, `submit_job_application`, `update_application_status_v3`, `submit_application_proof`.
- **Guardian relationships:** `create_guardian_invite_v2`, `accept_guardian_invite`.
- **Messaging and support:** `send_safe_message_v2`, `create_support_ticket`, `post_support_ticket_message`, `support_staff_change_status`.
- **Admin:** `admin_update_report_status`, `admin_set_account_status_v2`.
- **Verification:** `submit_business_verification`.

The web also performs selected direct table reads and writes for profile setup, saved jobs, safety pings, guardian pause state, reports, and legacy verification paths. The current RLS contract for those operations must be verified; no policy bypass or service-role key should be introduced.

## Authorization assumptions requiring backend confirmation

1. RPCs must derive the caller from the authenticated Supabase session and verify role, ownership, account state, and lifecycle transitions server-side.
2. Guardian access must require a current, active, mutually consented relationship on every relevant query/action; a page-level connection filter is not authorization.
3. Admin RPCs/pages must require a trusted staff claim or equivalent backend authorization, not a client-editable profile role.
4. Proof storage objects must remain private and signed URLs must be issued only to authorized participants/staff.
5. Account suspension, onboarding completion, minimum age, verification, and revocation gates must be consistent across web and mobile.

## Cross-platform tests to coordinate

- Same-user ownership and cross-user ID/URL mutation denial for profiles, jobs, applications, messages, reports, proof, and safety records.
- Teen status gates: unverified, pending, suspended, paused, guardian-revoked, and under-age.
- Guardian invite expiration, single-use, consent revocation, and post-revocation denial.
- Admin RPC denial for ordinary accounts and audit records for moderation/verification actions.
- OAuth callback and password-recovery redirects, including malformed external destinations.
- Idempotency/retry/concurrency for job, application, message, support, and proof RPCs.

## Known blockers and coordination requests

- Ask Codex Desktop/backend owner to confirm current production RPC signatures, RLS policies, storage policies, role claims, and suspension/guardian semantics for the approved project `jxbnrkasktbhtiujkhay`.
- Provide a test environment or approved accounts for separate teen, adult, guardian, and staff flows; do not use the deleted Supabase project.
- Confirm whether the mobile client uses the same onboarding/legal RPC versions and status vocabulary. No mobile changes or commits were available in this workspace.
- Decide on a production-safe admin business-verification review contract. The current web action is explicitly closed-testing-only and must not be treated as production verification.
- Review the eight moderate development-tool dependency advisories when compatible upstream fixes are available.

## Current web work

- Website PR #15 remains open and was not merged. Its passing CI and local checks make it ready for review.
- [Web hardening PR #16](https://github.com/mortapp/mort-web/pull/16) is open and stacked on PR #15; no CI checks were reported when this handoff was updated.
- No deployment or production settings were changed.
