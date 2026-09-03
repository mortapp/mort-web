# Fix the failing Vercel build

Two files were missing from `components/`. Add these two and the build goes green.

## Do this
1. Put both files into your `mort-web` repo's **`components/`** folder:
   - `components/segmented-tabs.tsx`
   - `components/sparkline.tsx`
2. Delete the stray duplicate file **`app/app/teen/earnings/page (1).tsx`** (the one with `(1)` in
   the name — it was an upload artifact).
3. Make sure the real earnings route is `app/app/teen/earnings/page.tsx` (the updated version from
   `mort-web-updates.zip`) so the sparkline actually shows. If in doubt, that file is the one that
   imports `@/components/sparkline` at the top.
4. Commit + push. Vercel rebuilds green.

## Why it broke
- `page (1).tsx` — a duplicate created when the files were added by hand; it imported the sparkline
  component, which wasn't in `components/` yet.
- `ui.tsx` referenced `./segmented-tabs`, which my Aug-30 copy expects but your current repo had
  moved on from. Adding `segmented-tabs.tsx` back satisfies it.

## The clean way forward (recommended)
Hand-placing nested files keeps biting us, and I've been shipping from a stale snapshot. **Send me
your current `mort-web` as a zip** and I'll:
- apply all four stages (polish, onboarding, dashboard crossing, earnings sparkline) onto YOUR
  latest code,
- switch shared-file edits (like `ui.tsx`) to minimal additions so nothing of yours is reverted,
- run `npm run build` on the whole repo, and
- hand you back a corrected, ready-to-commit set — one clean replace, no file surgery.
