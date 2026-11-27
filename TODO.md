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
