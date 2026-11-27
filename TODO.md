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
