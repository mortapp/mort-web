-- Security hardening from the Supabase security advisor
-- (0028_anon_security_definer_function_executable and 0008_rls_enabled_no_policy).
--
-- 1. Every public SECURITY DEFINER RPC that requires a signed-in caller (or an
--    admin/staff role) no longer grants EXECUTE to the anon role or to PUBLIC.
--    All of these functions already refuse anonymous callers internally
--    (authentication_required / admin_required / empty results); this removes
--    the unnecessary surface so unauthenticated requests are rejected at the
--    privilege layer instead. Verified before applying: neither mort-web nor
--    the mobile app calls any of these RPCs before sign-in.
--
-- 2. Explicit deny-all policies on the public tables that are intentionally
--    unreachable through the API (both apps use SECURITY DEFINER RPCs only).
--    RLS with no policy already denies everything; these policies document the
--    intent in the database and satisfy the linter. The remaining 20 linter
--    findings are tables in the non-exposed `private` schema, which PostgREST
--    never serves; they stay fail-closed by design.

revoke execute on function public.close_team_hustle_v1(uuid) from anon;
revoke execute on function public.create_team_hustle_v1(text, text, text, text, numeric, integer, text, text, text) from anon;
revoke execute on function public.get_runtime_feature_status() from anon;
revoke execute on function public.join_team_hustle_v1(uuid) from anon;
revoke execute on function public.leave_team_hustle_v1(uuid) from anon;
revoke execute on function public.list_my_verification_cases_v1() from anon;
revoke execute on function public.list_team_hustles_v1() from anon;
revoke execute on function public.mort_admin_list_users_v1(integer) from anon;
revoke execute on function public.submit_my_verification_evidence_v1(text, text) from anon;

revoke execute on function public.close_team_hustle_v1(uuid) from public;
revoke execute on function public.create_team_hustle_v1(text, text, text, text, numeric, integer, text, text, text) from public;
revoke execute on function public.join_team_hustle_v1(uuid) from public;
revoke execute on function public.leave_team_hustle_v1(uuid) from public;
revoke execute on function public.list_my_verification_cases_v1() from public;
revoke execute on function public.list_team_hustles_v1() from public;
revoke execute on function public.mort_admin_list_users_v1(integer) from public;
revoke execute on function public.submit_my_verification_evidence_v1(text, text) from public;

create policy deny_all_api_access on public.job_safety_cancellations
  for all to anon, authenticated using (false) with check (false);
create policy deny_all_api_access on public.legal_acceptance_audit_events
  for all to anon, authenticated using (false) with check (false);
create policy deny_all_api_access on public.legal_role_requirements
  for all to anon, authenticated using (false) with check (false);
create policy deny_all_api_access on public.team_hustle_members
  for all to anon, authenticated using (false) with check (false);
