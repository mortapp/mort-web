# MORT Workspace port → mort-web · Stage 1 (design polish)

This is the first, safe stage of bringing the **MORT Workspace** look into your real
`mort-web` Next.js app. It's **CSS only** — no logic, routes, data, or auth touched — so it
restyles the whole authenticated app (dashboard, jobs, messages, safety, admin, everything)
at once. Verified: `npm run build` compiles clean.

## What it changes
- Cards, metric tiles, job cards, threads and category tiles **lift on hover** (Workspace depth).
- Sidebar active item gets a **guiding-light glow**; nav icons nudge on hover.
- The **status journey** (application progress) now reads like the "crossing" — gradient
  connectors + a glowing current node.
- Dashboard stat tiles **rise in**, one beat apart.
- Primary buttons get a little more **dawn-glow** on hover.
- Nothing overrides your semantic metric color-coding, and everything respects
  `prefers-reduced-motion`.

## How to apply (pick one)

**A) Safest — paste the snippet (recommended if you've edited globals.css since Aug 30):**
Open `app/globals.css` in `mort-web` and paste the entire contents of **`WORKSPACE-POLISH.css`**
at the very end of the file. Commit + push → Vercel auto-deploys.

**B) Drop-in the whole file:** replace `app/globals.css` with the `globals.css` here — but ONLY
if you haven't changed `globals.css` in `mort-web` since I last worked on it (Aug 30). If unsure,
use option A.

```bash
# from your mort-web repo:
cat /path/to/WORKSPACE-POLISH.css >> app/globals.css
npm run build   # optional sanity check
git add app/globals.css && git commit -m "Workspace polish: hover-lift, sidebar glow, crossing journey" && git push
```

## Heads-up on my base copy
I worked from my snapshot of `mort-web` (last synced ~Aug 30). If you've pushed changes to
`globals.css` since, use **option A** so nothing of yours is lost — or send me the current
`mort-web` (zip) and I'll rebase everything exactly onto your latest.

## What's next (stages 2+)
Bigger Workspace features, ported into your real pages with your Supabase data:
count-up animated numbers on the dashboard, a ⌘K command palette, earnings sparkline/bars,
an activity heatmap + ratings on the profile, the animated "crossing" on the active-job view,
and the safety check-in flow. I'll do these screen-by-screen, build-verified, once you confirm
the base (your copy vs. mine).
