# Supabase Live Check Notes

Prepared after querying the existing MORT Supabase project `rakjydmgwwgtdislanbt`.

## Confirmed live

- The web app's required RPCs exist and are `SECURITY DEFINER`:
  - `save_job_draft_or_publish`
  - `manage_job_v2`
  - `submit_job_application`
  - `update_application_status_v3`
  - `submit_application_proof`
  - `create_guardian_invite_v2`
  - `accept_guardian_invite`
  - `send_safe_message_v2`
  - `create_support_ticket`
  - `post_support_ticket_message`
  - `submit_business_verification`
- Admin RPCs exist for account/report/support flows:
  - `admin_set_account_status_v2`
  - `admin_update_report_status`
  - `support_staff_change_status`
- `proof-uploads` storage policies already exist for owner insert, owner/participant/admin select, admin evidence update, and deleting unattached own proof objects.
- `payment_preferences` still has RLS enabled with no policies. The web UI must keep payment-preference writes disabled unless a safe backend RPC/policy is intentionally added later.
- Supabase security advisor still flags leaked-password protection as disabled.

## Remaining caveat

`business_verifications` has no visible UPDATE policy and no simple legacy `admin_review_business_verification` RPC was found. The web admin action therefore updates `profiles.verification_status` only for closed testing so the adult job-post gate can be tested. Do not treat this as final production business verification.
