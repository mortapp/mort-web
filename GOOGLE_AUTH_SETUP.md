# MORT Web Google Auth Patch

This zip adds Google OAuth buttons to both `/login` and `/signup` for the MORT web SaaS.

## What changed in code

- `app/(auth)/actions.ts`
  - Added `signInWithGoogle` server action.
  - Uses Supabase `signInWithOAuth({ provider: 'google' })`.
  - Redirects through `/auth/callback` so the SSR cookie session is saved.
- `app/(auth)/login/page.tsx`
  - Added **Continue with Google**.
- `app/(auth)/signup/page.tsx`
  - Added **Sign up with Google**.
- `app/auth/callback/route.ts`
  - Preserves the requested `next` path.
  - Sends new / unfinished accounts through onboarding.
  - Carries the signup role and display name into `ensureProfile` when available.
- `lib/auth.ts`
  - Reads Google `full_name` / `name` metadata as the default display name.
- `app/app/actions.ts`
  - Allows role selection to change before onboarding is completed, then locks it afterward.
- `app/globals.css`
  - Added divider/button styling.

## Dashboard setup required

The code will not work until Google is enabled in Supabase Auth.

### 1. Google Cloud

Create or use a Google OAuth Web application client.

Authorized JavaScript origins:

```text
https://mort-web.vercel.app
```

Authorized redirect URI:

```text
https://rakjydmgwwgtdislanbt.supabase.co/auth/v1/callback
```

When you add a custom domain later, add that origin too.

### 2. Supabase

Go to:

```text
Supabase Dashboard → Authentication → Providers → Google
```

Enable Google and add the Google Web OAuth Client ID and Client Secret.

Do not add any service-role key to Vercel or the frontend.

### 3. Supabase redirect allow-list

Keep these web URLs allowed:

```text
https://mort-web.vercel.app/auth/callback
https://mort-web.vercel.app/auth/confirm
https://mort-web.vercel.app/**
```

Keep the existing mobile deep-link URLs for the Android app.

## Test checklist

1. Click **Sign up with Google** from `/signup`.
2. Complete Google consent.
3. Confirm it returns to `/auth/callback`, then `/app/onboarding`.
4. Choose teen, adult, or guardian and save onboarding.
5. Sign out.
6. Click **Continue with Google** from `/login` using the same Google account.
7. Confirm it signs into the same MORT profile, not a duplicate account.
8. Test web/mobile sync with that user.

## Important limitation

Google OAuth only handles authentication. It does not replace MORT adult/business verification, payment setup, ID checks, SMS, push, moderation, or legal review.
