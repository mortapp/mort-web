# MORT Web — Next AI Start Here

Use this source as the current final candidate for closed-test deployment work.

Read these files first, in order:

1. `MORT-deploy-and-test-runbook.md`
2. `SUPABASE_LIVE_CHECK_NOTES.md`
3. `RPC_PATCH_SUMMARY.md`
4. `SCHEMA_RPC_COMPATIBILITY_REPORT.md`
5. `README.md`

Current status:

- The web app is intended for closed testing only, not public launch.
- Use the existing MORT Supabase project: `rakjydmgwwgtdislanbt`.
- Do not create a new Supabase project.
- Do not add a Supabase service-role key to Vercel or frontend code.
- Do not loosen RLS.
- Do not add fake payments, fake ID verification, fake SMS, or fake push notifications.
- Payment preferences remain disabled because the live backend has no safe write RPC/policy for them.
- Adult/business verification is still not production-real. For closed testing only, use the documented profile verification workaround.

Required validation:

```bash
npm ci
npm run lint
npm run build
```

Then deploy to Vercel and run the 14-flow live test checklist in `MORT-deploy-and-test-runbook.md`.
