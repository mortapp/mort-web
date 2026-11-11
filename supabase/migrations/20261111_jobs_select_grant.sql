-- Restore authenticated SELECT on public.jobs and public.job_applications.
--
-- The marketplace opened on 2026-11-11 with the web and mobile apps reading
-- job data directly from these tables (`.from('jobs')`), which is the intended
-- API surface for both apps. The authenticated role never received the
-- matching table grants, so every signed-in job browse fails with
-- "permission denied for table jobs" (teen marketplace, adult job
-- management, dashboard counts, admin job listing).
--
-- Row visibility remains enforced by RLS:
-- - jobs.jobs_select_visible: only open, safety-approved jobs posted by
--   active accounts, plus the poster's own rows and staff access.
-- - job_applications: no SELECT policy exists (fail-closed); granting the
--   table privilege alone exposes no rows until a policy is added.
--
-- Reversible with:
--   revoke select on public.jobs from authenticated;
--   revoke select on public.job_applications from authenticated;

grant select on public.jobs to authenticated;
grant select on public.job_applications to authenticated;
