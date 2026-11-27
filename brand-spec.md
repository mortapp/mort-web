# MORT Brand References — Auth Flow

MORT's existing auth identity is a high-contrast editorial split: deep black/ink, silver-white typography and restrained muted text. Preserve the production wordmark and ship/voyage mark; keep the form legible and avoid decorative stock or generated imagery.

## Real identity assets

- Favicon mark: `public/mort-mark.svg`.
- Auth/app logo component: `components/logomark.tsx`, rendered by `components/auth-shell.tsx`.
- Primary display type: Schibsted Grotesk, loaded by `app/layout.tsx`; body styles use the existing MORT token system in `app/globals.css` and `app/mort-2-theme.css`.

## Live UI references inspected before the change

- `assets/mort-brand/production-login-before.webp` — production `https://mortapp.org/login`, captured 2026-11-27.
- `assets/mort-brand/production-signup-before.webp` — production `https://mortapp.org/signup?next=%2Fapp`, captured 2026-11-27.

The screenshots are reference-only captures and are not used as website content. Their inspection overlays are not product UI and must not be incorporated into the published interface.
