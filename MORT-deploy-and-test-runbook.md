# MORT Web — Deploy & Test Runbook

Candidate reviewed: `mort-web-web-security-reviewed.zip` → `mort-web/` (Next.js 16.3.1, App Router, Supabase `@supabase/ssr`).

**What I actually did, and the limit of it:** I unzipped the archive, read every server action / RPC call site / auth path / storage path in the app, and ran `npm install`, `npm run build`, `npx eslint .`, and `npm audit` locally in my sandbox against a placeholder env file. All four passed clean (0 build errors, 0 lint errors, 0 audit vulnerabilities, all 30+ routes compiled). **I do not have network access to vercel.com or supabase.co, and no credentials for either** — so I cannot click your Vercel/Supabase dashboards or run the live RPC/RLS calls myself. Everything below the code-review section is a precise script for *you* to execute, built directly from reading the code and the audit reports already bundled in the zip (`SCHEMA_RPC_COMPATIBILITY_REPORT.md`, `RPC_PATCH_SUMMARY.md`).

A clean copy of the reviewed code (no `node_modules`, `.next`, or `.env.local`) is attached as `mort-web-deploy-ready.zip` — upload this to Vercel or push it to your own GitHub repo.

---

## 1. Code review — does it match your constraints?

| Constraint | Verified in code |
|---|---|
| No service-role key anywhere | Confirmed. `lib/supabase/{browser,server,proxy}.ts` all read only `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No `service_role` / `SUPABASE_SERVICE*` string appears anywhere in the source. |
| No RLS loosened | Confirmed — nothing in the app touches Postgres policies at all; it's a client. |
| No real payments / fake ID checks / fake SMS / fake push | Confirmed. No Stripe/Twilio/SendGrid/Plaid/Persona/Onfido/FCM/APNs strings anywhere. `savePaymentPreference()` unconditionally redirects with "disabled" — it never writes `payment_preferences`, regardless of form input. |
| Writes go through the live RPC layer, not direct table writes | Confirmed for job posting/management, applications, proof, guardian invites, messages, and support tickets — see §3 for the one place this *isn't* true. |
| Auth redirects don't hardcode localhost | Confirmed. `lib/site-url.ts` prioritizes `NEXT_PUBLIC_SITE_URL`, falling back to Vercel's own env vars, then `localhost` only as a last resort for local dev. Both `signUp` and `sendPasswordReset` build `emailRedirectTo` from this helper. |
| Suspension actually blocks access | Confirmed, and centrally enforced: `lib/auth.ts` → `requireUser()` checks `profile.account_status === 'suspended'` and force-signs-out + redirects on **every** protected page and server action (verified: every file under `app/app/**` and `(auth)` calls `requireUser`/`requireRole` except the pre-login auth actions, which is correct). |

**Bottom line on the code itself: it's solid.** It's the same conclusion the bundled audit reports reached — clean build, no dangerous patterns, correctly scoped to anon-key + RLS/RPC only. The real risk isn't in this code; it's in whether the *live* Supabase project's RPCs/policies match what this code assumes, which nothing (mine or the prior audits) has confirmed by actually calling them.

---

## 2. Three things to check first — flagged during this review

These are new findings from reading the code closely, on top of what the bundled reports already found:

**A. Admin actions still use direct table writes, not RPCs — untested against live RLS.**
`app/app/admin/actions.ts` (`reviewBusinessVerification`, `updateReportStatus`, `updateUserStatus`) does `.from(table).update(...)` directly, not through an RPC. The compatibility audit in the zip only checked the *teen/adult/guardian-side* write paths — it never looked at the admin file, so whether an admin can actually `UPDATE` `business_verifications`, `reports`, or `profiles.account_status` directly under live RLS is unverified. This directly affects your test flows **#4 (admin approve verification)** and **#13 (suspend)**. If either fails with a permission error, the fix is to find the matching RPC (likely something like `review_business_verification`, `admin_update_report_status`, `suspend_user`/`admin_set_account_status` — check `pg_proc`, see query in §4) and wire it the same way the rest of the app was patched — **not** to add an admin-only RLS bypass or a service-role key.

**B. Adult/business verification may be backend-gated as "not available yet."**
Per `SCHEMA_RPC_COMPATIBILITY_REPORT.md`, the live `submit_business_verification` RPC currently returns `business_verification_provider_required` — meaning the backend intentionally isn't accepting real verifications until a legal/provider workflow is connected. If that's still true, your **test flow #3** will show "Business/adult verification is not available yet" (the UI already handles this gracefully rather than faking success) and no row will land in `business_verifications` for admin to review in **#4**. This is a backend product decision, not a bug — see §5 step 3 for the manual workaround to unblock *closed testing only*.

**C. Storage RLS policy for `proof-uploads` is explicitly unconfirmed.**
The README says the policy SQL "has not been applied to or confirmed against the live project." The bucket itself almost certainly already exists (the compatibility audit found 9 buckets already provisioned, including `proof-uploads`), but whether the two policies below are already on it is unknown. See §5 step 4.

---

## 3. Deploy to Vercel

### 3a. Get the code onto Vercel
Pick one:

**Option 1 — Vercel CLI from the deploy-ready zip (fastest, no GitHub needed)**
```bash
unzip mort-web-deploy-ready.zip
cd mort-web
npx vercel login
npx vercel link          # create/select the mort-web project
npx vercel --prod
```

**Option 2 — GitHub import**
```bash
unzip mort-web-deploy-ready.zip
cd mort-web
git init
git add .
git commit -m "MORT web — security-reviewed candidate"
git branch -M main
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```
Then in Vercel: **Add New… → Project → Import** the repo. Vercel auto-detects Next.js; no build-command changes needed (`npm run build` / `.next` output, already verified above).

### 3b. Vercel — Environment Variables
Project → **Settings → Environment Variables**, add for Production (and Preview, if you'll test there too):

```
NEXT_PUBLIC_SUPABASE_URL=https://rakjydmgwwgtdislanbt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your existing MORT publishable key>
NEXT_PUBLIC_SITE_URL=https://mort-web.vercel.app
```
Do not add anything with `SERVICE_ROLE` in the name — the app never reads one, so there's nothing to gain and it would be a live secret sitting in a Next.js project for no reason.

Redeploy after adding env vars (Vercel doesn't retroactively apply them to an existing build).

### 3c. Supabase — Auth URL Configuration
Supabase dashboard → your MORT project → **Authentication → URL Configuration**:

- **Site URL:** `https://mort-web.vercel.app`
- **Redirect URLs** — add all three:
  - `https://mort-web.vercel.app/auth/callback`
  - `https://mort-web.vercel.app/auth/confirm`
  - `https://mort-web.vercel.app/**`

This is the piece that actually fixes the "confirms to localhost" failure mode: Supabase only honors the `emailRedirectTo` the app sends if it matches something in this allow-list — otherwise it silently falls back to the dashboard's Site URL. The app already sends the right URL (§1); this step is what lets Supabase accept it.

### 3d. Supabase — Storage for proof uploads
Storage → confirm the `proof-uploads` bucket exists and **Public is OFF**. If it doesn't exist yet:
```sql
insert into storage.buckets (id, name, public)
values ('proof-uploads', 'proof-uploads', false)
on conflict (id) do nothing;
```

Then, in the SQL editor, check what policies already exist on it before adding anything:
```sql
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;
```
If you don't see an insert policy and a select policy scoped to `proof-uploads`, add these (safe to run once — if a policy with the same name already exists this will error harmlessly with "policy already exists", it won't overwrite or loosen anything):

```sql
create policy "user can upload into own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'proof-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "read proof if related or admin"
on storage.objects for select
to authenticated
using (
  bucket_id = 'proof-uploads'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from proof_uploads pu
      join applications a on a.id = pu.application_id
      join jobs j on j.id = a.job_id
      where pu.storage_path = name
        and j.poster_id = auth.uid()
    )
    or exists (
      select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  )
);
```
This is scoped access (own folder, or the job's poster, or an admin) — not a loosening of RLS, it's what makes the already-private bucket usable at all.

---

## 4. Pre-flight check (read-only — run before clicking through the app)

Paste into the Supabase SQL editor. This tells you up front which of §2's risks are real, before you spend time manually testing:

```sql
-- Do the RPCs the app calls actually exist?
select proname from pg_proc where proname in (
  'save_job_draft_or_publish','manage_job_v2','submit_job_application',
  'update_application_status_v3','submit_application_proof',
  'create_guardian_invite_v2','accept_guardian_invite',
  'send_safe_message_v2','create_support_ticket','post_support_ticket_message',
  'submit_business_verification'
) order by 1;

-- Is there an admin-facing RPC for verification/report/suspension review
-- that admin/actions.ts should be using instead of direct table writes?
select proname from pg_proc
where proname ilike '%verification%' or proname ilike '%suspend%'
   or proname ilike '%report%' or proname ilike '%account_status%'
order by 1;

-- proof-uploads bucket present and private?
select id, public from storage.buckets where id = 'proof-uploads';
```
If any RPC from the first query is missing, that specific flow will fail with a Postgres "function does not exist" error — that's a backend-side gap, not something to patch by writing to the table directly.

---

## 5. Test accounts

You need four separate identities (four browser profiles or one browser + 3 incognito windows, since Supabase auth is cookie-based per-browser-profile):

1. **Teen** — sign up normally, choose "Teen worker" during onboarding.
2. **Adult** — sign up normally, choose "Adult / business" during onboarding.
3. **Guardian** — sign up normally, choose "Guardian" during onboarding.
4. **Admin** — `role` is never self-assignable from the UI by design (`lib/auth.ts` → `sanitizeRole`, admin is excluded from `SELF_ASSIGNABLE_ROLES` on purpose). Sign up a 4th account normally (any role), then in Supabase → **Table Editor → profiles**, find that user's row and manually set `role = 'admin'`. This is the intended way to create the first admin — not a workaround.

---

## 6. Test script, in your order

For each: exact steps, what success looks like, and what a failure most likely means given the code.

### 1. Signup/login email confirmation does not redirect to localhost
- Sign up a new account with a real inbox you control, using email+password (not the teen/adult/guardian account you'll reuse below — burn a throwaway one here).
- Check the confirmation email's link. **Pass:** it points at `https://mort-web.vercel.app/auth/callback?...` or `/auth/confirm?...`. **Fail:** if it points at `localhost:3000`, §3b (`NEXT_PUBLIC_SITE_URL` not set/redeployed) or §3c (Redirect URLs not saved) wasn't completed — the auth-code-error page in the app itself will tell you which of the two to check.
- Click it → should land on `/app/onboarding`, signed in.

### 2. Teen onboarding
- New tab, sign up the **teen** account. Land on `/app/onboarding`.
- Click the "Teen worker" card, fill bio / skills / school year, submit.
- **Pass:** redirected to `/app/teen/jobs` with "Welcome to MORT! Start browsing jobs."

### 3. Adult onboarding/verification request
- New tab/profile, sign up the **adult** account, choose "Adult / business" during onboarding.
- Go to **Verify** (or you'll be redirected there when trying to post a job). Fill "Adult / business verification" (business name + type required) → **Submit adult verification**.
- **Pass:** "Business/adult verification request submitted."
- **Likely finding (§2B):** message reads "Business/adult verification is not available yet" instead. If so, that's the live `business_verification_provider_required` gap — expected per the bundled audit, not a bug in this code. For closed testing only, an admin can manually set this adult's `profiles.verification_status = 'approved'` in Table Editor to unblock step 5; don't do this for real users later.

### 4. Admin approves adult/business verification
- Sign in as **admin** → `/app/admin` → **Verifications** tab.
- If step 3 actually created a row: click **Approve** on the adult's card.
- **Pass:** card status flips to `approved`, and the adult's `profiles.verification_status` updates too.
- **Fail:** a Postgres/RLS error on click means §2A is real — `reviewBusinessVerification`'s direct `.update()` is blocked live. Check §4's second query for the real RPC name and report back; don't work around it by loosening the `business_verifications` policy.

### 5. Adult posts a job (RPC path)
- As **adult** (now `verification_status = 'approved'`, from step 4 or the manual workaround): go to **Post a job**.
- Fill title, category, pay amount/label, city/state, description, teen age range 13–17, optionally check "requires guardian approval." Submit.
- **Pass:** redirected to `/app/adult/jobs` with "Job posted"; the "Publish" button is disabled until `isApproved` is true, which is the app itself enforcing the verification-gate, not just this doc.
- This calls `save_job_draft_or_publish` — a live RPC failure here means that RPC's payload shape doesn't match what the live function expects; the exact Postgres error will surface in the page's error banner.

### 6. Teen applies via `submit_job_application`
- As **teen**: browse `/app/teen/jobs`, open the job from step 5, write a note, click **Apply for job**.
- **Pass:** redirected to `/app/teen/applications`, application shows as `submitted` (or `guardian_pending` if either the teen's profile or the job itself requires guardian approval).
- Note: the age-gating / guardian-required / job-must-be-open checks that used to be hand-rolled client-side now live inside the `submit_job_application` RPC itself (per `RPC_PATCH_SUMMARY.md`) — if the teen's `dob` isn't set, expect a clear rejection rather than a silent pass, that's the intended fail-closed behavior.

### 7. Guardian invite/accept
- As **teen**: `/app/verify` → "Guardian invite code" card → **Create invite code**. Copy the code from the success banner (shown once — the backend only stores a hash after that).
- As **guardian**: `/app/verify` → "Guardian accepts invite" card → paste code → **Connect as guardian**.
- **Pass:** guardian redirected to `/app/guardian?message=Guardian connection accepted`, teen now appears under "Connected teens."

### 8. Guardian approval / pause behavior
- If the step-6 application is `guardian_pending`: as **guardian**, go to `/app/guardian` → "Pending approvals" → **Approve** (moves it to `adult_review`) or **Reject**.
- Then test pause: under "Connected teens," click **⏸ Pause account** on the teen. As **teen**, confirm a *new* job application or a *new* message thread is now blocked with "Your guardian has paused your account…" — and confirm the Safety page's SOS/check-in still works (pause is intentionally scoped, not a full lock). Click **▶ Resume account** to undo.

### 9. Adult accepts/rejects applications
- As **adult**: `/app/adult/applications` → find the teen's application → **Accept** or **Reject**. Try **Start work** (→ `in_progress`) then **Complete** to walk the full lifecycle.
- **Pass:** each click redirects with "Application updated" and the status badge changes. This is `update_application_status_v3` — a rejected transition (e.g. skipping straight to `completed`) should come back as a clear RPC error, not a silent no-op.

### 10. Message thread / send via `send_safe_message_v2`
- As **adult**, on an `accepted`-or-later application: click **💬 Message applicant** — creates the thread and opens it.
- Send a normal message ("Hi, can you start Saturday?") — **pass:** appears in the thread, no flag.
- Send one that should trip the keyword scanner, e.g. "text me at 317-555-0139 instead" — **pass:** message still sends (scanner flags for review, it doesn't block), but you'll see "flagged for review" in the toast. As **admin**, there's currently no dedicated "flagged messages" queue in the admin UI shown in this build — flagged status lives on the `messages` row itself, worth checking directly in Table Editor if you rely on it for moderation.
- Confirm messaging is refused on a `guardian_pending`/`guardian_rejected` application, and confirm the **🚩 Report** link on the thread works (routes to `/app/reports/new`).

### 11. Proof upload with the private `proof-uploads` bucket
- Get an application to `in_progress` (step 9). As **teen**: `/app/teen/active` → the application should now show a JPEG upload field (it's hidden until `in_progress`).
- Upload a JPEG under 10MB.
- **Pass:** "Proof uploaded successfully," and it appears for the **adult** on their job's applicant view and for **admin** under Admin HQ → "Proof review" with a working "View" signed-URL link.
- **If it fails:** the app distinguishes bucket-missing vs. policy-blocked errors in the message itself — that tells you directly whether it's a §3d bucket problem or a §3d policy problem.

### 12. Support ticket create/reply
- As any signed-in user: `/app/support` → fill category/subject/message → **Submit ticket**.
- **Pass:** lands on the ticket detail page with "Ticket submitted." Add a reply via **Send reply**.
- As **admin**: Admin HQ → **Support** tab, confirm the ticket is visible with the right subject/requester.
- Note: the admin "In progress / Resolve / Close" buttons on that tab are a **known stub** in this build — they just redirect with "Support status changes need the admin support RPC" and don't actually change status. That's documented behavior, not a bug to chase.

### 13. Suspended account is actually blocked
- As **admin**: Admin HQ → **Users** tab → find the **teen** test account → click **Suspend**.
- As **teen** (existing session, don't sign out first): try to load any `/app/*` page or submit any action (e.g. apply to a job).
- **Pass:** immediately signed out and redirected to `/login` with "This account has been suspended. Contact MORT support if you think this is a mistake." — this should happen even mid-session, since `requireUser()` checks on every request.
- If the `updateUserStatus` click itself errors instead of the suspension taking effect, that's §2A again (direct `profiles` update blocked by live RLS for admin) — check the same `pg_proc` query in §4.
- Reactivate via **Active** when done so you don't lose the test account.

### 14. Payment preference UI stays disabled unless a safe backend RPC exists
- As any user: `/app/payments`.
- **Pass:** every field is visibly `disabled`, the page states the live backend has no safe RPC for this yet, and clicking the submit button ("Why can't I save?") redirects back with the same disabled-explanation message — no write happens under any input, by construction (`savePaymentPreference()` ignores `formData` entirely). This one should not fail regardless of live backend state, since it never talks to the database at all.

---

## 7. Is it safe for closed testing?

**Conditionally yes** — with two things resolved first, not skipped:

1. **Confirm §2A live** (run the `pg_proc` query in §4, then actually click Approve/Suspend as admin). This gates whether verification review and suspension — two safety-relevant controls — genuinely work, or silently no-op behind an RLS error. Don't open this to real teen users until admin suspend is confirmed working end-to-end.
2. **Apply/confirm the storage policies in §3d.** Proof upload is currently unverified live; if the read policy isn't right, an adult or admin could either fail to see legitimate proof, or (worse, if a policy is missing/misconfigured) too broad a set of users could read proof photos. Confirm the policy set matches exactly what's in §3d before real use.

Everything else — RPC-routed writes, no service-role key, no fake payment/ID/SMS/push, centrally-enforced suspension gate, message-scanner flagging for grooming/off-platform patterns, guardian pause/approve, disabled payment UI — checks out from the code itself and is architecturally sound. The remaining risk is entirely "does the live backend's RLS/RPC surface match what this client assumes," which is exactly what the ordered test pass above is designed to surface. Once §2A and §3d are confirmed (or fixed via the matching RPC — never via a broader policy or a service-role key), this is reasonable to open to a small closed test group.
