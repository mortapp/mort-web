# MORT Workspace → mort-web · updates

Everything I've changed for the "make it the real app" port, in one place. Files are laid out
to mirror your `mort-web` repo, so each one drops into the same path. **CSS/UI only — no logic,
routes, data, or auth touched.** Each change is verified with `npm run build`.

Whenever I add more, this same zip grows — one bundle, not scattered files.

## What's included

| # | File | Path in mort-web | What it does |
|---|------|------------------|--------------|
| 1 | `app/globals.css` | `app/globals.css` | Full updated stylesheet — adds the Workspace polish layer (hover-lift on cards/metrics/job cards, sidebar active glow, crossing-style status journey, stat entrance). Restyles the whole app. |
| 1b | `WORKSPACE-POLISH.css` | *(paste at end of `app/globals.css`)* | The **same** polish as a paste-only snippet, if you'd rather not replace the whole file. |
| 2 | `components/onboarding-form.tsx` | `components/onboarding-form.tsx` | Onboarding rebuilt as a short **3-step wizard** (Role → About you → Details). Same fields, same `saveOnboarding` action — no server changes. |

## How to apply

Copy the files into your `mort-web` repo at the matching paths, then commit + push (Vercel
auto-deploys):

```bash
# from your mort-web repo root, with this folder unzipped alongside:
cp /path/to/mort-web-updates/components/onboarding-form.tsx components/onboarding-form.tsx

# globals.css — pick ONE:
#   A) safest (keeps your current file): paste WORKSPACE-POLISH.css at the end
cat /path/to/mort-web-updates/WORKSPACE-POLISH.css >> app/globals.css
#   B) drop-in the whole file (only if you haven't edited globals.css since ~Aug 30)
# cp /path/to/mort-web-updates/app/globals.css app/globals.css

npm run build   # optional sanity check
git add -A && git commit -m "Workspace port: onboarding wizard + design polish" && git push
```

## Heads-up on my base copy
Built from my snapshot of `mort-web` (~Aug 30). `components/onboarding-form.tsx` is self-contained
so it's safe to drop in. For `globals.css`, if you've edited it since, use option **A** (the paste
snippet) so nothing of yours is lost — or send me the current `mort-web` zip and I'll rebase exactly.

## Coming next (each added to this same zip, build-verified)
Dashboard count-up stats + the animated active-job "crossing" · ⌘K command palette · earnings
sparkline/bars · profile activity heatmap + ratings · safety check-in flow.
