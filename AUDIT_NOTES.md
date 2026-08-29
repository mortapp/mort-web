# MORT visual and functional audit

## Browser-verified defects

1. **False success state:** The signup URL displays an account-confirmation message with a warning/error treatment. A successful registration looks like a failure.
2. **Misleading primary navigation:** The public “Browse jobs” call to action and the footer equivalent route unauthenticated visitors directly to a protected dashboard path. They cannot browse without first discovering they must sign up.
3. **False category destination:** Every homepage category tile routes to the generic signup page, despite presenting itself as category-specific browsing.
4. **False affordance in hero:** The visible “Apply” control inside the decorative job preview is styled as a button but is not interactive.
5. **Over-compressed system:** The landing page relies on a dense grid of repeated dark cards, small metadata, mixed emoji, and near-identical elevation. It obscures the product’s hierarchy instead of making the job marketplace feel easy to scan.
6. **Auth layout is desktop-only by construction:** Login and signup use a fixed 50/50 split with large inline paddings and no responsive layout rule, causing a predictable narrow-screen failure.
7. **Production build environment drift:** `npm run build` was inheriting a non-standard `NODE_ENV`, producing an error-boundary prerender failure. The build succeeds when run with `NODE_ENV=production`, so the scripts now enforce the correct environment.

## Repair standard

The repair pass removes false affordances, makes public navigation honest, adds a responsive auth shell, improves visible contrast and hierarchy, and fixes the build environment issue without masking runtime errors.

## Post-repair validation

* The public homepage now presents `Browse jobs` as an honest signup-first flow and preserves the intended jobs destination through account setup.
* Category tiles now preserve their selected category destination and use the neutral label `Explore jobs` when a live count is unavailable.
* The hero preview no longer presents a decorative, non-functional `Apply` button.
* The signup confirmation message is now presented as successful feedback, and the sign-in link preserves the requested destination.
* Browser validation confirms the signup form retains `/app/teen/jobs` as its internal post-authentication destination and emits no client console errors.
* `npm run lint` and `npm run build` both complete successfully after the script correction.
