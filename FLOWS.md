# Public web smoke checks

## Account deletion
- Start: mortapp.org.
- Steps: choose Delete account in the footer, then open the page directly.
- Expect: the Delete your MORT account heading, an email link for the published privacy contact, a link to the Privacy Policy, and no password or document fields.

## Existing public navigation
- Start: mortapp.org.
- Steps: open Sign in, Get started, Safety, and Privacy, and check that an unauthenticated visit to /app routes to sign-in.
- Expect: the existing pages still load and the workspace remains private. No production account creation or request submission is required to check this navigation.
