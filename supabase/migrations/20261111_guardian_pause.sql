-- Guardian pause support (Issue #70: guardian authorization).
--
-- A guardian with an active, fully-consented link can pause a teen's
-- marketplace activity. A paused teen cannot submit job applications or
-- send messages until the guardian resumes them. Pause state lives on the
-- profile row, is only settable through the guarded RPC below (which
-- verifies the guardian link and writes an audit record), and is enforced
-- inside the SECURITY DEFINER application/messaging RPCs.

alter table public.profiles
  add column if not exists guardian_paused boolean not null default false,
  add column if not exists guardian_paused_at timestamptz,
  add column if not exists guardian_paused_by uuid;

-- The web reads the pause flag to explain the restriction in the UI.
-- Audit columns (paused_at / paused_by) intentionally receive no grant.
grant select (guardian_paused) on public.profiles to authenticated;

create or replace function private.is_guardian_paused(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and guardian_paused
  );
$fn$;

create or replace function public.mort_set_guardian_pause_v1(p_teen_id uuid, p_paused boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user uuid := auth.uid();
  v_target_role public.mort_role;
begin
  if v_user is null or not private.is_active_user() then
    return jsonb_build_object('ok', false, 'code', 'active_account_required');
  end if;

  -- The caller must be an admin staff member, or a guardian with an active,
  -- mutually-consented link to this teen.
  if not private.has_staff_role(array['admin']::public.mort_role[]) and not exists (
    select 1
    from public.guardian_links gl
    where gl.guardian_user_id = v_user
      and gl.teen_user_id = p_teen_id
      and gl.status = 'active'
      and gl.teen_consent_at is not null
      and gl.guardian_consent_at is not null
  ) then
    return jsonb_build_object('ok', false, 'code', 'active_guardian_link_required');
  end if;

  select role into v_target_role from public.profiles where id = p_teen_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'target_user_not_found');
  end if;
  if v_target_role is distinct from 'teen'::public.mort_role then
    return jsonb_build_object('ok', false, 'code', 'target_must_be_teen');
  end if;

  update public.profiles
  set guardian_paused = p_paused,
      guardian_paused_at = now(),
      guardian_paused_by = v_user,
      updated_at = now()
  where id = p_teen_id;

  insert into public.admin_audit_log (actor_id, action, target_type, target_id, reason, metadata)
  values (
    v_user,
    'guardian_pause_set',
    'profile',
    p_teen_id::text,
    case when p_paused then 'Teen activity paused by guardian' else 'Teen activity resumed by guardian' end,
    jsonb_build_object('paused', p_paused)
  );

  return jsonb_build_object('ok', true, 'paused', p_paused);
end;
$fn$;

revoke all on function public.mort_set_guardian_pause_v1(uuid, boolean) from public, anon;
grant execute on function public.mort_set_guardian_pause_v1(uuid, boolean) to authenticated, service_role;

-- Enforce the pause inside the job application RPC.
create or replace function public.mort_submit_job_application(p_job_id uuid, p_cover_note text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.jobs%rowtype;
  v_eligibility jsonb;
  v_application_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if not private.is_active_user()
     or private.current_role() is distinct from 'teen'::public.mort_role then
    raise exception 'An active teen account is required';
  end if;
  if private.is_guardian_paused(v_user_id) then
    raise exception 'Your guardian has paused your account. Ask them to resume it before applying to jobs.';
  end if;
  if p_cover_note is not null and char_length(p_cover_note) > 1000 then
    raise exception 'Cover note exceeds 1000 characters';
  end if;
  select * into v_job
  from public.jobs job
  where job.id = p_job_id
  for update;
  if not found then raise exception 'Job is not available'; end if;
  v_eligibility := public.get_job_application_eligibility(p_job_id);
  if coalesce(v_eligibility->>'eligible', 'false') <> 'true' then
    raise exception '%', coalesce(v_eligibility->>'message', 'Job application is not eligible');
  end if;
  insert into public.job_applications(job_id, applicant_id, cover_note)
  values (p_job_id, v_user_id, nullif(btrim(p_cover_note), ''))
  returning id into v_application_id;
  return v_application_id;
end;
$function$;

-- Enforce the pause inside the messaging RPC.
create or replace function public.mort_send_message(p_conversation_id uuid, p_body text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
declare
  v_user uuid := auth.uid();
  v_message uuid;
  v_other_user uuid;
  v_conversation public.conversations%rowtype;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if not private.is_active_user() then raise exception 'Active account required'; end if;
  if private.is_guardian_paused(v_user) then
    raise exception 'Your guardian has paused your account. Ask them to resume it before messaging.';
  end if;
  if p_body is null or char_length(btrim(p_body)) < 1 or char_length(p_body) > 4000 then
    raise exception 'Message must contain 1 to 4000 characters';
  end if;
  select * into v_conversation
  from public.conversations conversation
  where conversation.id = p_conversation_id
  for update;
  if not found or v_conversation.status <> 'active' or not exists (
    select 1 from public.conversation_members member
    where member.conversation_id = p_conversation_id and member.user_id = v_user
  ) then
    raise exception 'Conversation unavailable';
  end if;
  for v_other_user in
    select member.user_id
    from public.conversation_members member
    where member.conversation_id = p_conversation_id
      and member.user_id <> v_user
    order by member.user_id
  loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        least(v_user, v_other_user)::text || ':' || greatest(v_user, v_other_user)::text,
        0
      )
    );
  end loop;
  if exists (
    select 1
    from public.conversation_members mine
    join public.conversation_members theirs
      on theirs.conversation_id = mine.conversation_id
     and theirs.user_id <> v_user
    join public.user_blocks block
      on (block.blocker_id = v_user and block.blocked_id = theirs.user_id)
      or (block.blocker_id = theirs.user_id and block.blocked_id = v_user)
    where mine.conversation_id = p_conversation_id
      and mine.user_id = v_user
  ) then
    raise exception 'Messaging is unavailable';
  end if;
  insert into public.messages(conversation_id, sender_id, body, moderation_status)
  values (p_conversation_id, v_user, btrim(p_body), 'pending')
  returning id into v_message;
  update public.conversations set updated_at = now() where id = p_conversation_id;
  return v_message;
end;
$function$;
