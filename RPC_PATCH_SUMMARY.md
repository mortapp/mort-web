# MORT Web RPC Compatibility Patch Summary

This patch applies the key finding from `SCHEMA_RPC_COMPATIBILITY_REPORT.md`: the live MORT backend expects write operations through existing SECURITY DEFINER RPC functions instead of direct table insert/update calls.

## Changed

- Rewired adult job posting to `save_job_draft_or_publish`.
- Rewired adult job status changes to `manage_job_v2`.
- Rewired application transitions to `update_application_status_v3`.
- Rewired teen job applications to `submit_job_application`.
- Rewired proof recording to `submit_application_proof` and changed proof upload path/type to match live backend requirements.
- Rewired guardian invite creation/acceptance to `create_guardian_invite_v2` and `accept_guardian_invite`.
- Rewired message sends to `send_safe_message_v2`.
- Rewired support ticket create/reply to `create_support_ticket` and `post_support_ticket_message`.
- Disabled payment preference writes because no safe live RPC exists.
- Fixed support ticket reads from `user_id` to `requester_id`.
- Removed UI reliance on stored plaintext guardian invite codes.

## Not changed

- No RLS policies were loosened.
- No Supabase service-role key was added.
- No new Supabase project was created.
- No real payments, Stripe flows, SMS, push notifications, or fake ID verification were added.

## Validation limitation

I could not complete `npm ci` / `npm run build` in this sandbox because package installation timed out / offline cache was incomplete. The next AI or local/Vercel environment should run:

```bash
npm ci
npm run lint
npm run build
```

Then test live flows with separate teen/adult/guardian/admin accounts against project `rakjydmgwwgtdislanbt`.
