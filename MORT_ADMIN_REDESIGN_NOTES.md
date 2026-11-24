# MORT Admin Dashboard UI — redesign record

**Mode:** Redesign · Preserve. Apply the homepage's editorial black-and-white language to `/app/admin` without changing its information architecture or moderation behavior.

**Preserve:** Admin role gates; all existing Supabase queries and limits; five queue tabs and labels; count badges; review forms, field names, server actions and pending states; evidence links and expiry; safety escalation details; read-only report/support constraints; status semantics and error/empty states.

**Improve:** Clearer heading hierarchy, generous whitespace, quiet table and queue surfaces, monochrome buttons/tabs, readable desktop metrics, and deliberate narrow-screen layouts.

**Remove:** Glassy/elevated treatment and redundant decorative icon tiles from this route only; no underlying data or actions are removed.

**Protected contracts:** `/app/admin`, its auth boundary, form inputs/actions, database/RPC behavior, navigation labels and all read-only disclosures.

**Design read + dials:** Admin operations workspace for staff; editorial monochrome, reference fidelity 10/10, information density 6/10, motion 1/10, responsive polish 8/10. White/ink/silver with semantic status colors retained only for meaning.

**Highest risk:** Styling shared global component classes. Mitigation: all overrides are descendant-scoped to the admin page wrapper.

**Fallback:** Remove the admin route module and wrapper to restore the existing shared theme; no schema, action, or content migration is involved.
