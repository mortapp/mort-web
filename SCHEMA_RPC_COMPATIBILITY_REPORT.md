# MORT Web — Schema/RPC Compatibility Report

**Prepared:** August 16, 2026
**Scope:** `mort-web-liquid-glass-handoff-final.zip` source code checked against the live `Mort` Supabase project (`rakjydmgwwgtdislanbt`), read-only.

## Headline finding

**The live Supabase backend is not the blank slate the source package's README describes.** It's an already-mature, actively developed production system: 192 applied migrations, 254 tables (all RLS-enabled), 9 storage buckets already provisioned (including `proof-uploads`), and ~250 `SECURITY DEFINER` RPC functions implementing business logic for jobs, applications, payments (Stripe), identity verification, messaging, support, and safety incidents.

`mort-web` was built to talk to this database using **direct table reads/writes** (`supabase.from(table).insert/update/upsert`). The live RLS policies mostly do **not** allow that — they expect the equivalent RPC functions instead. The result: most of `mort-web`'s write paths will fail outright against this database with permission-denied errors, even though `npm run build`/`lint`/`npm audit` all pass, because none of that catches a live-RLS mismatch.

This wasn't visible in the earlier build/lint/audit validation, and it means the server-action logic that was spot-checked and approved (e.g. teen age-gating in `applyToJob`) is sound in isolation but **never executes**, because the `INSERT` it depends on is rejected before that logic's result is ever written.

## Write paths that will fail

| Feature | mort-web code | What happens against live DB | Correct real path |
|---|---|---|---|
| Post / edit / close a job | `app/app/adult/actions.ts` → `.from('jobs').insert()/.update()` | **Blocked.** `jobs` has only `SELECT` policies for `authenticated`; no `INSERT`/`UPDATE` policy exists at all. | `save_job_draft_or_publish(p_job_id, p_client_request_id, p_payload, p_publish)`, `manage_job_v2(p_job_id, p_action, p_reason, p_client_request_id, p_expected_updated_at)` |
| Apply to a job | `app/app/teen/actions.ts` → `applyToJob()` → `.from('applications').insert()` | **Blocked.** Policy `applications_insert_admin_only` — only `admin` can insert directly. | `submit_job_application(p_job_id, p_note, p_availability_confirmed, p_portfolio_ids)` |
| Accept/reject/complete an application | `app/app/adult/actions.ts` → `setApplicationStatus()` → `.from('applications').update()` | **Blocked.** Policy `applications_update_admin_only`. | `update_application_status_v3(p_application_id, p_action, p_client_request_id, p_expected_updated_at)` |
| Submit proof of work | `app/app/teen/actions.ts` → `.from('proof_uploads').insert()` | **Blocked.** Policy `proof_uploads_insert_admin_only`. | `submit_application_proof(p_proof_id, p_application_id, p_storage_path, p_note)` |
| Business/adult verification | `app/app/verify/actions.ts` → `submitBusinessVerification()` → `.from('business_verifications').insert()` | **Blocked.** Policy `business_verifications_insert_admin_only`. Also expects a pre-created `verification_id` + evidence document, not a raw text form. | `submit_business_verification(p_verification_id, p_storage_path, p_business_name, p_business_type, p_notes)` |
| Guardian invite create/accept | `app/app/verify/actions.ts` → `createGuardianInvite()` / `acceptGuardianInvite()` → direct `guardian_connections` insert/update | **Blocked.** Insert and update are both `..._admin_only`. Also, live schema stores `invite_code_hash` (hashed), not the plaintext `invite_code` mort-web reads/writes. | `create_guardian_invite_v2(p_invite_email)`, `accept_guardian_invite(p_invite_code)` |
| Send a message | `app/app/messages/actions.ts` → `sendMessage()` → `.from('messages').insert()` | **Blocked.** `messages` has zero `INSERT` policy for `authenticated` (SELECT only). Thread *creation* (`message_threads` insert) does work — a participant-insert policy exists — but no message can ever be sent into it afterward. | `send_safe_message_v2(p_thread_id, p_body, p_client_request_id)` |
| Create support ticket | `app/app/support/actions.ts` → `createSupportTicket()` → `.from('support_tickets').insert({user_id, message, ...})` | **Blocked and column-mismatched.** No `INSERT` policy exists on `support_tickets` at all, and the live table has no `user_id` column (it's `requester_id`) or `message` column (message bodies live only in `support_ticket_messages`). | `create_support_ticket(p_subject, p_message)` |
| Reply to support ticket | `app/app/support/actions.ts` → `replyToTicket()` → `.from('support_ticket_messages').insert()` | **Blocked.** No `INSERT` policy on `support_ticket_messages` (SELECT only). | `post_support_ticket_message(p_ticket_id, p_message, p_client_request_id)` |
| Save payment preference | `app/app/actions.ts` → `savePaymentPreference()` → `.from('payment_preferences').upsert()` | **Blocked entirely.** `payment_preferences` has RLS enabled with **zero policies of any kind** — not even `SELECT`. | No RPC found (searched for any `%payment_pref%` function — none exists). This looks like a genuine gap; worth a direct question to whoever owns the backend rather than an assumption on my part. |

## What does work as direct table access (verified compatible)

- Profile / role onboarding writes: `profiles`, `teen_profiles`, `adult_profiles`, `guardian_profiles` all have self-scoped `INSERT`/`UPDATE` policies that permit mort-web's upsert pattern.
- Reads generally: broad `SELECT` policies exist across the tables mort-web queries.
- Report creation: `reports_insert_reporter` allows a direct insert by the reporter.
- Safety ping creation: `safety_pings_insert_teen` allows a direct insert.
- Starting a message thread (not sending into it): participant-scoped insert policy exists on `message_threads`.
- Saved jobs/folders: self-owned policies exist.

## Secondary finding: incomplete status vocabulary

`app/app/adult/actions.ts`'s `canTransitionApplication()` only recognizes 8 of the live `application_status` enum's 14 values (`submitted`, `guardian_pending`, `guardian_rejected`, `adult_review`, `accepted`, `rejected`, `completed`, `disputed`). Missing: `viewed`, `in_progress`, `proof_submitted`, `completion_pending_release`, `canceled`. Moot while the underlying `UPDATE` is blocked by RLS anyway, but relevant if this logic gets ported into a call to `update_application_status_v3`.

## Bottom line

This isn't a "few env vars and RLS policies left to configure" situation, which is what the source package's deployment checklist implies. Getting `mort-web` actually working against this backend means **rewriting the write side of most server actions to call the existing RPC layer** (which already implements the validation logic mort-web hand-rolled — often more completely) rather than hitting tables directly. The read side and profile/onboarding writes are largely fine as-is.

I haven't modified anything in the Supabase project — everything above came from read-only queries (`list_tables`, `list_migrations`, `pg_policies`, `pg_proc`, `get_advisors`).
