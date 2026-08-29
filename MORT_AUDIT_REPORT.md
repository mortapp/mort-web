# MORT Website Audit and Repair Report

**Scope.** This audit reviewed the supplied Next.js project for visible UI failures, misleading interactions, responsive risks, production-build reliability, and high-confidence future defects. The repaired project was linted and built successfully after the changes.

## What was wrong and what was fixed

| Priority | Finding | Why it was a real problem | Repair completed |
| --- | --- | --- | --- |
| High | Public “Browse jobs” links opened an authenticated route directly. | A new visitor met an access barrier rather than a clear conversion path. | Public links now lead to sign-up and preserve the requested jobs destination through signup, confirmation, and onboarding. |
| High | Homepage category tiles all linked to generic signup. | Tiles looked category-specific but discarded the chosen category. | Each tile now preserves its category filter as the post-onboarding destination. |
| High | Signup success feedback was styled as an error. | “Check your email to confirm your account” looked like a failed registration. | The forced error variant was removed; successful confirmation now receives a success treatment. |
| High | `npm run build` inherited a non-standard environment and failed in the error-boundary prerender path. | The submitted project could appear to compile locally but fail in production. | Development and production scripts now explicitly set `NODE_ENV`; lint and build now pass. |
| High | Sign-up and login used a hard-coded two-column desktop split. | The layout was predictably cramped on narrow screens and duplicated logic across pages. | A shared responsive auth shell now collapses into a mobile-first reading order. Password reset and password update now use the same finished experience. |
| Medium | The public header removed links on small screens instead of providing mobile navigation. | Core public navigation became unavailable at smaller widths. | A keyboard-labeled mobile navigation control and dismissible menu are now included. |
| Medium | The decorative hero preview contained a styled but inactive “Apply” button. | It was a false affordance in the highest-visibility area. | The decorative control is now an honest non-interactive “Verified host” status. |
| Medium | Zero job counts displayed “New on MORT.” | The label implies availability while the live count may be zero. | The neutral label is now “Explore jobs.” |
| Medium | Global entrance animation was applied to every card and list item. | Dense job/applications lists can feel unstable and initially hide content while users scan. | Repeating cards are immediately readable; motion remains reserved for meaningful feedback. |
| Medium | Payment preference updated the profile even if the primary payment write failed. | The account could claim a preference that was never saved. | The profile update now occurs only after a successful payment-preference write. |
| Medium | Empty money input was coerced into zero cents. | An absent amount could be presented as a $0 job instead of “TBD.” | Empty or malformed amounts now resolve to `null`. |
| Medium | Job posting did not validate teen age ranges before inserting. | Inverted or out-of-policy age ranges could reach the database. | The server action now requires integer ages from 13 to 17 with a valid minimum/maximum order. |

## Visual critique addressed

The original interface had a technically polished dark theme, but too many surfaces used the same dark-card elevation, emoji weight, and small muted text. This made the job marketplace read as a large collection of equally important modules rather than a clear funnel. The repair preserves the existing MORT identity but raises secondary-text contrast, removes the misleading decorative control, slows the visual churn, gives the hero a stronger refractive focal plane, and makes the auth journey one coherent system instead of four unfinished or divergent screens.

## Items still required before a real launch

| Risk | What needs to happen | Reason |
| --- | --- | --- |
| Supabase configuration | Set real `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the deployed `NEXT_PUBLIC_SITE_URL`. Configure the same site URL and auth redirect URLs in Supabase. | The archive includes an example file with a placeholder key; real authentication cannot operate from it alone. |
| Database reproducibility | Export and version the Supabase schema, migrations, row-level security policies, and storage policies. | No SQL migration files were included in the supplied archive, so a new environment cannot be reproduced or security-reviewed from this zip. |
| Authenticated-flow testing | Test onboarding, job posting, applications, guardian controls, messaging, reports, and admin moderation using separate teen, adult, guardian, and admin accounts. | The public flow and static build were verified locally, but real authenticated flows require the actual Supabase project and policies. |
| Device and accessibility testing | Confirm the new header and auth shell on real iOS/Android browsers and run a keyboard/screen-reader pass. | The responsive implementation is in place, but production device testing should verify touch behavior, focus order, and real browser rendering. |
| Asset hosting | If deploying outside the current managed environment, host the generated brand and refractive image assets in the selected deployment’s static asset store and retain the existing fallback treatment. | The repair references managed image paths for the logo and visual accents; external hosting needs an equivalent asset location. |

## Validation completed

| Check | Result |
| --- | --- |
| Lint | Passed with `npm run lint`. |
| Production build | Passed with `npm run build`. |
| Public homepage | Verified the corrected browse-jobs destination, preserved category destinations, and removal of the false Apply control. |
| Signup success state | Verified it renders as success feedback and retains the internal `/app/teen/jobs` destination. |
| Browser console | No client-side console output was present on the repaired signup route. |

> The attached revised archive contains the source repair and this report. The original user data, database schema, and Supabase secrets were not altered.
