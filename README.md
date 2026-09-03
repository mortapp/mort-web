# MORT Workspace → mort-web · updates

Everything I've changed for the "make it the real app" port, in one bundle. Files mirror your
`mort-web` repo layout, so each drops into the matching path. Every change is verified with
`npm run build` against your app. **No auth/routing/data-model changes** — same Supabase queries,
same server actions. This zip grows as I add more.

## What's included

| File → path in mort-web | What it does |
|---|---|
| `app/globals.css` | Full stylesheet with the **Workspace polish** layer (hover-lift, sidebar active glow, crossing-style status journey, stat entrance). Restyles the whole app. |
| `WORKSPACE-POLISH.css` *(paste at end of `app/globals.css`)* | The **same** polish as a paste-only snippet, if you'd rather not swap the whole file. |
| `components/onboarding-form.tsx` | Onboarding rebuilt as a short **3-step wizard** (Role → About you → Details). Same fields, same `saveOnboarding` action. |
| `app/app/page.tsx` | Dashboard now shows **"Your active crossing"** — the teen's current job drawn as a voyage (Applied → Accepted → In progress → Completed), wired to their real accepted/in-progress application. Count-up stats were already there. |
| `components/ui.tsx` | `StatusJourney` extended to cover the full lifecycle (`in_progress`, `proof_submitted`, `completion_pending_release`) so the crossing looks right at every stage — improves it everywhere it's used (applications pages too). Additive: no existing behavior changed. |
| `components/sparkline.tsx` *(new)* | Tiny dependency-free SVG sparkline that draws itself on (pure CSS). Server component. |
| `app/app/teen/earnings/page.tsx` | Earnings page now shows an **"Earnings over time"** sparkline — completed pay bucketed into the last 6 months, from the same `applications`→`jobs` query. |

## How to apply

Copy the files into `mort-web` at the matching paths, then commit + push (Vercel auto-deploys):

```bash
cp -r mort-web-updates/app mort-web-updates/components ./   # into your mort-web repo root
# For globals.css you can instead paste WORKSPACE-POLISH.css at the end of your current file.
npm run build   # optional sanity check
git add -A && git commit -m "Workspace port: onboarding wizard, dashboard crossing, journey lifecycle, polish" && git push
```

## Heads-up on my base copy
Built from my snapshot of `mort-web` (~Aug 30). `onboarding-form.tsx` and `app/app/page.tsx`
are the intended replacements for those screens. For `globals.css` and `components/ui.tsx`, if
you've edited them since, either eyeball the diff or send me the current `mort-web` (zip) and I'll
rebase exactly — the `ui.tsx` change is just added `case`s in `buildJourneySteps`.

## Coming next (same zip, build-verified)
⌘K command palette · profile activity heatmap + ratings · richer topbar (search) · safety
check-in flow.
