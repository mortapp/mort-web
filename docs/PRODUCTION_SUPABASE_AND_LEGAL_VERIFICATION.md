# Production Supabase and legal verification

The public site uses the Supabase project `jxbnrkasktbhtiujkhay`. Its Content Security Policy derives the permitted origin from `NEXT_PUBLIC_SUPABASE_URL`, validates it as an HTTPS Supabase project URL, and rejects any other project during a production Vercel build. Preview builds retain their configured Supabase project.

The current Vercel environment variables for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` were created before the current production project existed. The production values are separated from Preview and set to the current project's URL and publishable key. Preview retains its original values.

The website's four static legal documents were compared with the current production database records on 2026-10-29. Each record was published and had attorney-review metadata. Their version labels and SHA-256 content hashes are recorded in `content/legal-publication-manifest.json`. `npm run verify:legal` checks website content against that verified production snapshot and prints only mismatch names, never document text.

The build does not query the legal tables directly. Their Supabase Row Level Security policies permit reads only to authenticated users, so a safe anonymous build-time comparison is unavailable; adding a privileged key to the public website or the build was not appropriate. When an approved legal version changes, update the production database, static content, and snapshot manifest together, then rerun the verifier.

The older project reference remains in three historical audit/patch records that explicitly describe checks run against the retired project. They are retained as historical evidence; current configuration, setup guidance, and active production code use the current project.
