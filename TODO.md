# MORT Auth Flow — Outcomes

- [x] Preserve the requested destination across protected app entry and authentication. When an unauthenticated visitor opens `/app` or `/app/...` (including onboarding), keep the safe in-app path as `next` on login/signup and preserve it through existing email/Google auth callbacks; reject destinations outside `/app`.
- [x] Make the MORT journey clear across signup and login. Signup shows account creation → onboarding → review-gated access. When login is returning to `/app/onboarding`, show a compact, accessible cue that sign-in will return the visitor to onboarding; retain the existing MORT visual identity and responsive behavior.
- [x] Preserve account and safety contracts. Keep signup DOB minimum-age enforcement, role handling, field names and order, OAuth state, login/signup form actions, all four onboarding steps, legal acknowledgements, pending-review wording, and dashboard authorization behavior unchanged.
- [x] Ship one substantial UX improvement to the live MORT website. Run `npm run typecheck`, `npm run lint`, `npm run test:production-config`, and `npm run build`; commit and push to `origin/main` without force-pushing, then confirm the matching production deployment is READY.

## Shipping evidence

- Auth-flow implementation commit: `9a9d4635c6f1a823c60645ef6de9b0e26d41e755` (`feat(auth): preserve destination through onboarding flow`).
- Vercel project `mort-web`: matching production deployment was `READY` on `main` for that commit.
- Live `https://mortapp.org/app/onboarding?next=%2Fapp` responded with HTTP 307 and a `Location` to `/login?next=%2Fapp%2Fonboarding%3Fnext%3D%252Fapp` with the resume-setup message.
- Live login server-rendered the contextual return-to-onboarding cue and saved-destination journey; live signup server-rendered the Account → Setup → Review journey.
- Validation completed before push: `npm run typecheck`; `npm run lint` (0 errors; one existing Google Fonts warning in `app/layout.tsx`); `npm run test:production-config` (33/33); `npm run build` (including legal verification).

## Follow-up — onboarding resume from the dashboard gate

- [x] When the signed-in visitor arrives with `Finish setting up your MORT account to continue.` and the progress contract is available, replace that auto-dismissing toast with a persistent checkpoint panel that identifies the server-selected current step and explains that marketplace access still follows account review.
- [x] Give the visitor a direct “Continue setup” link to the active onboarding step while preserving the four existing server actions, form fields, DOB/role safeguards, legal acknowledgements, and dashboard/review gates; leave every other message on the existing toast behavior.
- [x] Run the production checks, push the scoped change to `origin/main` without force-pushing, and verify the matching `mort-web` production deployment is READY and the live onboarding route still preserves the guard message.

Feature commit `0cea045486322603e662898010a804c6b04fd177` is on `origin/main`; Vercel deployment `dpl_25M1EHJdp1Ny8V2xxAKm5PkpGmHK` is `READY` for production aliases `mortapp.org` and `www.mortapp.org`. The live onboarding URL returns HTTP 307 to login with the original setup message encoded in `next`. Validation passed: typecheck; lint (0 errors, one pre-existing Google Fonts warning); production-config and contract tests (34/34); production build and legal verification.

## Follow-up — signup paths before account details

- [x] Before entering signup details, visitors can choose the visible “I’m a teen”, “I’m an adult”, or “I’m a guardian / parent” path; preserve the existing `teen`, `adult`, and `guardian` role values and role-matched signup defaults.
- [x] Show teens before signup that teen accounts require a verified school email address on an approved school domain to continue teen onboarding.
- [x] Keep date of birth authoritative: reject anyone under 13; derive teen status for ages 13–17 regardless of selected role; sanitize adult role choices so an adult cannot self-assign the teen role. Preserve the DOB check for email and Google signup, the account fields, and the existing onboarding/review gates.
- [x] Run typecheck, lint, production-config/contract tests, and production build; push without force-pushing; verify the matching Vercel production deployment is READY and inspect the live signup page.

Shipping evidence: feature commit `9d71807174ce66ed39d5c733fc52d7018fffbdd1` is on `origin/main`; Vercel deployment `dpl_x7PBuU9TJ84pYNRgJGQ2AC41qY1z` is `READY` for production aliases `mortapp.org` and `www.mortapp.org`. Live signup returned HTTP 200 and included the teen, adult, and guardian choices, approved-school-email requirement, DOB guidance, and existing DOB/email/password fields. Validation passed: typecheck; lint (0 errors, one pre-existing Google Fonts warning); production-config and contract tests (35/35); production build; legal publication verification.

## Follow-up — bulk-select required acknowledgements

- [x] On the onboarding Review and finish step, when the legal service is available and required document acknowledgements are outstanding, show an explicit “Accept all required” button.
- [x] Clicking it selects only the required acknowledgement checkboxes currently shown (including the teen summary checkbox when present); it does not select optional or already-recorded items, submit the form, mark acceptance complete, or fill the electronic signature. Keep individual checkboxes, published document text/version/hash display, server-side legal validation, any required electronic signature, and the separate “Finish setup” submission unchanged.
- [x] Run typecheck, lint, production-config/contract tests, and production build; push without force-pushing; verify the matching production deployment is READY and confirm the live onboarding route still enforces sign-in while preserving its return path.

Shipping evidence: feature commit `f5b6c4c051cec0a3cd3f1b122c956f1e96d6c5ed` is on `origin/main`; Vercel deployment `dpl_5epkGotor2qe3MSNoe5TP4Laxpxp` is `READY` for `mort-web` production aliases `mortapp.org` and `www.mortapp.org`. An unauthenticated request to `/app/onboarding` returns HTTP 307 to `/login` with the onboarding destination preserved; the authenticated Review screen was not directly rendered in this verification session. Validation passed: typecheck; lint (0 errors, one pre-existing Google Fonts warning); production-config tests (36/36); production build and legal publication verification.


## Follow-up — adult ID submission and phone handoff

- [x] Adults on `/app/onboarding` can move directly from the government-ID requirements to `/app/verify` using an “Upload your ID” action; the signed-in account sidebar also exposes Identity verification, while all existing onboarding and verification routes remain unchanged.
- [x] On `/app/verify`, adults can select ID evidence from their computer using the browser file picker. Accept JPG/JPEG, PNG, WebP, HEIC, or PDF up to 10 MB; keep the existing authenticated upload action, MIME/size validation, private `verification-evidence` bucket, own-folder path, registration RPC, cleanup, pending-case limit, and staff-review status behavior.
- [x] An adult can explicitly turn on a supported computer camera, grant browser permission, capture an ID photo, preview it, retake it, and optionally capture a second side. Camera/photo handling stays in the browser until the user submits; if two browser-readable images are captured/imported, combine them locally into one JPEG because the existing review RPC accepts one evidence object. A supplied single multi-page PDF remains a direct option.
- [x] If camera APIs are unsupported, permission is denied, or no camera is available, explain the issue and leave file import usable. Never start the camera automatically. Stop media tracks after capture, when the camera closes, and when the uploader unmounts; allow camera policy only for MORT's same origin and continue blocking microphone access.
- [x] Offer a phone QR that opens the same-origin `/app/verify` route in the phone browser. The QR contains only that route, no ID image, access token, or transfer secret; do not call it encrypted or imply it transfers a file. The user must sign in to the same MORT account on the phone before uploading.
- [x] Preserve teen evidence requirements, guardian-invite tools, all existing MORT verification statuses, authenticated route gates, private storage, owner/staff access policies, and staff review; do not add a no-login phone transfer or change the database/RPC case model.
- [ ] Run typecheck, lint, production-config/contract tests, and production build; commit and push the scoped change to `origin/main` without force-pushing; confirm the matching `mort-web` Vercel production deployment is READY before calling the feature live.
