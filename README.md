# MORT Web — Liquid Glass Edition

MORT is a safe, local teen hustle marketplace: teens (13–17) find nearby paid jobs, adults/businesses post jobs, guardians monitor and approve safety, and admins review verification, reports, and disputes.

This build is a **Next.js 16 (App Router)** app on **Supabase**, redesigned with a rose-gold / baby-blue / soft-pink "liquid glass" UI on a deep black base, with real feature wiring for proof uploads, job-based messaging, guardian approvals, admin review, onboarding, safety, and support tickets.

> **MVP disclaimer:** MORT does not process payments, move money, hold escrow, collect bank/card/SSN data, or make any real background-check, push-notification, or SMS claims. Where the current Supabase schema doesn't support a feature, the UI says so clearly instead of faking it.

---

## 1. Deploy on Vercel

### Option A — Vercel Drop (fastest)
1. Go to [vercel.com/new](https://vercel.com/new) and drag this project folder (or a zip of it) onto the page — or use `vercel deploy` from this folder with the [Vercel CLI](https://vercel.com/docs/cli).
2. When prompted, set the **Environment Variables** listed in section 2 below.
3. Deploy. Vercel auto-detects Next.js.

### Option B — Git import
1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. In Vercel, "Add New… → Project" → import the repo.
3. Add the environment variables from section 2.
4. Deploy.

Build command: `npm run build` (already verified — see "Build result" note below). Output: standard Next.js `.next` — no special Vercel config needed.

---

## 2. Required environment variables

Set these in Vercel (Project → Settings → Environment Variables) and locally in `.env.local` (copy from `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://rakjydmgwwgtdislanbt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
NEXT_PUBLIC_SITE_URL=https://mort-web.vercel.app
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — your Supabase project's URL and **publishable/anon** key (Project Settings → API in Supabase). These are safe to expose in the browser.
- `NEXT_PUBLIC_SITE_URL` — the deployed URL of this app. Used to build auth redirect/callback links.
- **Never** set a Supabase **service role** key in this project. Nothing in the app code reads one, and none should be added — all data access goes through the publishable key and Supabase Row Level Security (RLS).

---

## 3. Supabase auth redirect configuration

In your Supabase project, go to **Authentication → URL Configuration** and set:
- **Site URL**: same value as `NEXT_PUBLIC_SITE_URL`
- **Redirect URLs**: add `${NEXT_PUBLIC_SITE_URL}/auth/callback` and `${NEXT_PUBLIC_SITE_URL}/auth/confirm` (plus `http://localhost:3000/auth/callback` and `.../auth/confirm` for local dev)

The app already implements `/auth/callback`, `/auth/confirm`, `/auth/signout`, and `/auth/auth-code-error`.

---

## 4. Storage setup for proof uploads (required for Feature 1)

Proof uploads uses **direct client-to-Supabase-Storage uploads** (no file passes through a Vercel serverless function, so there's no Vercel body-size limit issue). The UI already handles a missing bucket/policy gracefully and shows a clear warning — but to make proof uploads actually work, run this setup once:

### 4a. Create the bucket
In the Supabase dashboard → **Storage → New bucket**:
- Name: `proof-uploads`
- Public: **OFF** (keep it private — proof photos should not be publicly listable)

Or via SQL:
```sql
insert into storage.buckets (id, name, public)
values ('proof-uploads', 'proof-uploads', false)
on conflict (id) do nothing;
```

### 4b. Storage RLS policies
**Updated for the live RPC backend (see "RPC Compatibility Repair Notes" below).** Files are uploaded under the flat path `{user_id}/{proof_id}.jpg` — no application-id folder segment — because that's the exact path shape the live `submit_application_proof` RPC expects. The uploader's own auth id is still always the first (and only) folder segment, so the insert policy is a simple, standard "you can only write into your own folder" check. Because the path no longer embeds the application id, a job poster/admin *read* policy can no longer derive the relationship from the path — it has to join through the `proof_uploads` table's `storage_path` column instead:

```sql
-- Teens can upload into their own folder only
create policy "user can upload into own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'proof-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Teens can view their own proof; job posters can view proof for their jobs; admins can view all
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

The `recordProofUpload` server action (`app/app/teen/actions.ts`) no longer writes the database row directly — it calls the live `submit_application_proof` RPC, which re-validates that the application belongs to the uploading teen server-side before recording it. The storage policy above and the RPC's own check are still independent layers, not a substitute for each other.

Adjust table/column names above if your live schema differs from what this build assumes (see section 7). This exact policy has not been applied to or confirmed against the live project by this repair pass — verify it (or the live equivalent) is actually in place before relying on job-poster/admin proof review working.

### 4c. What the app does if this isn't set up yet
- Upload attempts show a friendly error ("bucket does not exist" / "blocked by storage policy") instead of crashing.
- Proof lists on the teen, adult, and admin pages show an inline warning banner with the actual Supabase error, instead of silently showing nothing.

---

## 5. Support ticket schema (Feature 9)

The app expects:
- `support_tickets`: `id, user_id, category, subject, message, status, created_at, updated_at`
- `support_ticket_messages`: `id, ticket_id, sender_id, body, created_at`

`status` is treated as one of `open / in_progress / resolved / closed`. If your live tables use different column names, the Support and Admin pages will surface the exact Postgrest error in a warning banner rather than failing silently — adjust the column names in `app/app/support/actions.ts` and the two support pages to match, or alter your tables to match the names above.

---

## 6. Security fixes (P0/P1 audit response)

An external audit surfaced 5 P0 and 6 P1 findings, all fixed in this version. Full details below; source of truth is the diff, this is a summary.

**P0 — privilege escalation / missing server-side checks:**
- **Role tampering** — `profiles.role` could be set to `admin` by tampering the hidden `role` field in the onboarding form (and, worse, directly at signup, via `user_metadata`). Fixed with a single `sanitizeRole()` gate in `lib/auth.ts` used everywhere a role gets written (`ensureProfile`, `signUp`, `saveOnboarding`) — `admin` is never client-assignable, and an existing role (including admin) is never overwritten.
- **Apply flow bypassed job state/age/guardian rules** — `applyToJob` didn't check the job was actually `open`, didn't check the teen's age against `jobs.teen_min_age/teen_max_age`, and could be tricked into skipping guardian approval by calling the action directly. Fixed: fetches the job first, blocks non-open jobs, computes age from `profiles.dob` (fails closed if DOB is missing — asks the teen to add it rather than silently allowing), and requires guardian approval if either the teen's profile or the job itself requires it.
- **Adult application/job status updates trusted `formData` with no ownership or transition check** — either action could be called directly with an arbitrary `status` value or against a job the caller doesn't own. Fixed: both now fetch the row first, verify ownership (or admin), and whitelist legal status transitions (e.g. an application can't jump straight to `completed` without passing through `accepted`).
- **Messaging could be started on a `guardian_pending`/`guardian_rejected` application** — the UI hid the button, but the server action didn't check. Fixed: `startThreadFromApplication` now checks the application's status server-side.

**P1:**
- **Message scanner language overclaimed** — copy and landing-page marketing implied blocking/detection; the scanner only flags for review. Copy fixed everywhere (in-app and marketing) to say "flagged for review," and a matching **"block tools"** feature claim on the landing page was removed since no such feature exists.
- **Safety ping status wasn't whitelisted** — a teen could submit `status=missed` (meant to be system-generated) via the custom check-in form. Removed from the UI and the server action now only accepts `ok`/`needs_help`.
- **Proof upload storage path didn't start with the uploader's id** — fixed to `{user_id}/{application_id}/...`, and the README's RLS policy example updated to match (a simple "first folder = auth.uid()" insert policy instead of a join).
- **Verification actions could silently switch a user's role** (including demoting an admin who accidentally submitted a verification form) — fixed with the same "only fill an unset role" rule used everywhere else. Role switching after onboarding is not supported by design.
- **npm audit: 6 high-severity advisories** (next/postcss/sharp chain, plus brace-expansion/js-yaml/nanoid) — fixed by upgrading to Next 16.3.1 and running `npm audit fix`. `npm audit` now reports 0 vulnerabilities.
- **"Cash and Cash App only" footer/copy contradicted the actual payment-preference options** (`cash`, `cash_app`, `square_link`, `flexible`, `none`) — copy corrected in both places it appeared.

**Also fixed while in the area (not in the original audit, same problem category):** a marketing claim that MORT does "identity verification" (it doesn't — admin review of a text submission, not ID verification); "real-time" safety-ping language (pings are refresh-based, documented as such); an unenforceable "24-hour" report-response promise; and — since the copy above kept the "guardian can pause a teen's account" claim rather than deleting it — that feature is now actually implemented (`teen_profiles.paused_by_guardian` existed in the schema but nothing ever set it to `true`). A paused teen can't apply to new jobs or start new message threads; existing threads and safety pings still work.

**Lint was also broken, not just undocumented** — `next lint` was removed entirely in Next 16 (not just its config wizard). Added a proper flat `eslint.config.mjs` and changed the `lint` script to call `eslint` directly. `npm run lint` now runs clean (was crashing before; fixed ~40 real `react/no-unescaped-entities` errors and 2 `react-hooks/set-state-in-effect` issues it surfaced once it could actually run).

## 7. What's fully working

- **Design system v3** — rebuilt against explicit UI/UX principles rather than a simple recolor:
  - **Depth**: dark-mode elevation via discrete brightness steps (`--el-1/2/3`), not blur-on-every-surface. Blur is reserved for the sticky header/sidebar only.
  - **Shadows**: subtle at rest, strongest on popovers/modals/toasts — not the other way around.
  - **Typography**: single family (**Plus Jakarta Sans**, swapped from Inter) — warmer and rounder, reads well for both teens and adults — limited to a 7-size scale, tightened header tracking (-2%/-3%), 115% header line-height.
  - **Spacing**: strict 4pt scale end to end (`--sp-1` … `--sp-20`).
  - **Color**: one primary (rose-gold) with light/dark variants, plus real semantic colors — blue = trust/info, red = error, yellow = warning, green = success only (audited and fixed every leftover decorative use of green).
  - **Buttons**: the default button is a true ghost (outline, no fill) so secondary actions never compete with primary CTAs; explicit hover/active(pressed)/disabled/focus-visible states on every variant.
  - **Overlays**: gradient-to-solid treatment (`.overlay-gradient`, `.overlay-gradient-side`) instead of flat color, used on the login/signup hero panel and landing page hero visual.
- **Micro-interactions** — a real `<Toast>` component (slide-in, auto-dismiss, strips the URL param) replaced the static `?message=` banner across 19 pages; a `<SubmitButton>` (via `useFormStatus`) shows a spinner + pending label on the primary forms (login, signup, onboarding, profile, post-job, message reply, support tickets) instead of a button that does nothing visible until the redirect lands.
- **Reusable components** — `GlassCard`, `MortButton`, `StatusBadge`, `MetricCard`, `PageHeader`, `EmptyState`, `DangerZone`, `RoleBadge`, `JobCard`, `ApplicationCard`, `MessageThreadCard`, `SafetyActionCard`, `AdminReviewCard`, `SegmentedTabs`, `StatusJourney`, skeleton loaders, `Toast`, `SubmitButton` (`components/ui.tsx`, `components/toast.tsx`, `components/submit-button.tsx`).
- **Card hierarchy pass** — `JobCard` now leads with a gradient category-icon tile (fast scanning), title + price sharing the top row (price in accent color, top-right — it used to sit alone at the bottom competing with nothing), and demoted meta/description. Wired into job browse, saved jobs, and the adult's posted-jobs list, replacing duplicate inline markup that still looked like a spreadsheet.
- **Signifiers** — `SegmentedTabs` gives the active category filter a real "lifted" state instead of just a color change; `StatusJourney` renders an application's progress as a connected-dot route (submitted → guardian/adult review → decision) instead of a single flat badge; a `.tooltip` primitive is wired onto icon-only controls and the "guardian required" badge.
- **Icon/avatar tiles everywhere** — every repeating card (jobs, admin review items, challenges, connected teens, applicants, dashboard quick-actions) leads with a gradient icon tile (`.job-card-icon` / `.card-icon-tile` / `.avatar-tile`) instead of a bare floating emoji, so the whole app shares one scannable visual language instead of each page inventing its own.
- **Proof uploads** — teens upload directly to Supabase Storage from `/app/teen/active`; adults see proof on their job's applicant page; admins see a platform-wide proof review table. Signed URLs (1 hour) are generated server-side.
- **Job-based messaging** — threads can only be started from a real application (`startThreadFromApplication`), never a freeform DM. A lightweight keyword scanner flags messages that look like off-platform pressure or contact-info sharing (`clean` / `flagged` statuses). Refresh-based, not realtime (see limitations). Report button on every thread.
- **Guardian approvals** — guardians see applications with status `guardian_pending` from their connected teens and can Approve (→ `submitted`) or Reject (→ `guardian_rejected`), with ownership/connection checks in the server action. Guardians can also **pause a connected teen's account** — blocks new job applications and new message threads (existing threads and safety pings still work) — using the `teen_profiles.paused_by_guardian` column.
- **Admin review** — business verification approve/reject, report triage (reviewing/resolved/dismissed), user suspend/reactivate, plus new: platform-wide proof review, support ticket management, and a "needs help" safety-ping alert banner.
- **Onboarding** — visual role picker (teen/adult/guardian) with conditional fields, redirects to the right home per role (teen → jobs, adult → verify, guardian → guardian dashboard, admin → admin), and a notice (not a hard block) if onboarding was already completed.
- **Safety center** — SOS / "I'm safe" / custom check-ins, guardian + admin visibility, explicit 911/emergency-services disclaimer, and a note that push/SMS alerts are not implemented (database insert only).
- **Job flow** — browse/filter/apply/save/track for teens; post/review/accept/reject/complete/dispute for adults. Fixed two pre-existing bugs: the adult dashboard was counting jobs via a non-existent `posted_by` column (should be `poster_id`) and applicants via a non-existent `pending` status (now counts `submitted`/`adult_review`).
- **Legal pages** — full draft Terms & Privacy covering every topic requested (guardian involvement, no guaranteed work/payment, off-platform risk, reports/moderation, suspension, safety limitations, emergency disclaimer, and — for privacy — every data category MORT touches), each clearly marked as a draft pending real legal review.
- **Support tickets** — create/list/reply for users, manage/resolve for admins, with graceful fallback if the schema doesn't match.
- **UI polish** — loading skeletons (`app/app/loading.tsx`), error boundaries (`app/error.tsx`, `app/app/error.tsx`), fixed mobile sidebar toggle (was hard-hidden via inline style before), fixed sign-out button (was posting to a non-existent `/api/logout`, now posts to the real `/auth/signout` route), empty states everywhere.

## 8. What's partial / needs your Supabase schema to match

- **Proof uploads** only insert the columns the starter code already used (`application_id, uploaded_by, storage_path, note`). If you want file size/mime type stored, add those columns and extend `recordProofUpload` in `app/app/teen/actions.ts`.
- **Messaging** assumes `message_threads` has `job_id, application_id, teen_id, adult_id, guardian_id, updated_at` and `messages` has `thread_id, sender_id, body, scanner_status, created_at` — this matches the starter's existing query shape (`.or('teen_id.eq...,adult_id.eq...,guardian_id.eq...')`), but wasn't independently verified against a live database.
- **Support tickets** — see section 5. If the tables don't exist yet, the pages show the real error instead of a working list.
- **Team hustles** (`/app/team-hustles`) is intentionally left as a documented placeholder — there's no team/group schema in the known table list, and the brief says not to invent backend structure. It explains exactly what's missing instead of pretending to work.
- **"Mark progress" for in-progress jobs** — not implemented. There's no progress/status field for this in the known schema beyond the application status enum, so it wasn't invented.

## 9. Known limitations (by design)

- **No real-time.** Messages and safety pings are refresh-based (standard Postgres reads on page load / server action redirect), not Supabase Realtime subscriptions.
- **No push/SMS.** Safety pings write to the database only. No push notifications, SMS, or email alerts are sent, and the UI says so on the Safety page.
- **No payments.** MORT never processes, moves, or guarantees payment. Payment preferences (`/app/payments`) are informational only.
- **Message scanner is a basic keyword matcher** (`lib/mort.ts` → `scanMessage`), not an ML/AI moderation pipeline. It flags obvious patterns (phone numbers, "off platform", "don't tell your parent", etc.) — treat it as a first line of defense, not a guarantee.
- **Legal pages are drafts.** Terms and Privacy are original draft copy meant to cover the right topics — they are explicitly not final legal documents and say so on the page.
- **No lint config.** This starter's `package.json` has a `lint` script (`next lint`), but Next 16 removed the auto-scaffolded ESLint config this depended on, and no `.eslintrc`/`eslint.config` file exists in the project. `npm run build` still runs full TypeScript type-checking (and passed cleanly — see below), but there's no separate lint step to run until an ESLint config is added.

## 10. Build result

```
npm ci && npm run build
```
Compiles successfully, TypeScript checks pass, all 30+ routes generate cleanly (verified in this build).

---

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase values
npm run dev
```

## Project structure

- `app/` — Next.js App Router pages, grouped by `(auth)`, `app/` (authenticated dashboard), `legal/`, `safety/`.
- `components/` — shared UI (`ui.tsx`), app shell/nav (`app-shell.tsx`, `site-header.tsx`), and feature widgets (`proof-upload.tsx`, `onboarding-form.tsx`).
- `lib/` — Supabase client factories (`lib/supabase/`), auth helpers (`lib/auth.ts`), money formatting (`lib/money.ts`), and MORT-specific constants/helpers (`lib/mort.ts` — storage bucket name, file validation, message scanner).

## RPC Compatibility Repair Notes

This archive was patched to target the live MORT Supabase project (`rakjydmgwwgtdislanbt`) as a mature backend, not as a blank starter database.

The web app write paths that were previously direct table writes have been rewired toward the existing SECURITY DEFINER RPC layer where available:

- Job posting now calls `save_job_draft_or_publish`.
- Job state management now calls `manage_job_v2`.
- Teen applications now call `submit_job_application`.
- Application status changes now call `update_application_status_v3`.
- Proof record creation now calls `submit_application_proof`.
- Guardian invite creation/acceptance now calls `create_guardian_invite_v2` and `accept_guardian_invite`.
- Message sending now calls `send_safe_message_v2`.
- Support ticket creation/replies now call `create_support_ticket` and `post_support_ticket_message`.
- Payment preference writes are intentionally disabled because the live backend had RLS enabled with no usable write policy or replacement RPC in the compatibility audit.

Do not “fix” blocked write paths by loosening RLS policies or putting a service-role key in Vercel. The correct direction is to use the backend RPC layer.

### Required live testing

After deployment, test with separate teen, adult, guardian, and admin accounts against the real Supabase project. Build and TypeScript checks cannot detect live RLS/RPC mismatches.

### Known partial areas

- Business verification RPC currently returns `business_verification_provider_required`; the UI should treat adult/business verification as unavailable until the approved legal/provider workflow is connected.
- Payment preferences are read-only/disabled until a safe backend RPC exists.
- Proof uploads are restricted to JPEG, max 10MB, path `<auth.uid>/<proof_id>.jpg`, bucket `proof-uploads`, matching the live `submit_application_proof` RPC.

## Supabase live check update

A live read-only Supabase check confirmed that the core RPCs used by this web candidate exist on the existing MORT project. Admin report/status/support actions were adjusted to use `admin_update_report_status`, `admin_set_account_status_v2`, and `support_staff_change_status`. The `proof-uploads` bucket policies were already present. Payment-preference writes remain disabled because `payment_preferences` has RLS enabled with no public-safe write policy or web-ready RPC.

Business/adult verification is still not production-complete. No simple legacy admin-review RPC for `business_verifications` was found, and that table did not expose an UPDATE policy in the live policy check. For closed testing only, the web admin verification action marks `profiles.verification_status` so the adult job-post gate can be tested. A real production business-verification workflow still needs a legal/provider-backed backend flow.


## Google OAuth web login

This package includes Google login/signup buttons for the web SaaS. Read `GOOGLE_AUTH_SETUP.md` before testing because Supabase Auth Provider settings and a Google OAuth Web Client must be configured in the dashboards.
