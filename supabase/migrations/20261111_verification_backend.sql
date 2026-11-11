-- Verification backend: live MORT staff document review
-- 1. Storage rules locking verification-evidence to each user's own folder
-- 2. submit_my_verification_evidence_v1 / list_my_verification_cases_v1
-- 3. get_my_verification_requirements_v1 and get_my_identity_verification_v2
--    updated for the live staff-review flow
-- 4. mort_review_verification_case now syncs profiles.verification_status

-- ---------------------------------------------------------------
-- 1. Storage: verification-evidence is write-own-folder, read own-or-staff,
--    never updatable or deletable by clients (evidence is immutable).
-- ---------------------------------------------------------------
create policy mort_verification_evidence_insert_own_folder
on storage.objects for insert to authenticated
with check (
  bucket_id = 'verification-evidence'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy mort_verification_evidence_read_own_or_staff
on storage.objects for select to authenticated
using (
  bucket_id = 'verification-evidence'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or private.has_staff_role(array['admin','moderator']::public.mort_role[])
  )
);

-- HEIC is accepted by the website uploader; allow it in the bucket.
update storage.buckets
set allowed_mime_types = array_append(allowed_mime_types, 'image/heic')
where name = 'verification-evidence';

-- Real documents are now collected through the live staff-review flow.
update public.mort_release_control
set real_document_collection = true, updated_at = now()
where is_primary;

-- ---------------------------------------------------------------
-- 2. Client-callable verification RPCs
-- ---------------------------------------------------------------
create or replace function public.submit_my_verification_evidence_v1(
  p_verification_type text,
  p_evidence_path text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user uuid := auth.uid();
  v_dob date;
  v_age integer;
  v_expected text;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'code', 'authentication_required');
  end if;

  -- Evidence type must match the account's real age band (from date of birth).
  select p.date_of_birth into v_dob from public.profiles p where p.id = v_user;
  if v_dob is null or v_user is null then
    return jsonb_build_object('ok', false, 'code', 'dob_required');
  end if;
  v_age := private.mort_age_years(v_dob);
  if v_age < 13 then
    return jsonb_build_object('ok', false, 'code', 'minimum_age_required');
  end if;
  v_expected := case when v_age between 13 and 17 then 'school_id' else 'identity' end;
  if p_verification_type is null or p_verification_type <> v_expected then
    return jsonb_build_object('ok', false, 'code', 'evidence_type_age_mismatch', 'expected', v_expected);
  end if;

  -- Evidence path must be the caller's own folder, a single generated
  -- UUID filename, and an allowed extension. Blocks path traversal,
  -- cross-user folders, and arbitrary names.
  if p_evidence_path is null
     or p_evidence_path !~ ('^' || v_user::text
        || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|heic|webp|pdf)$') then
    return jsonb_build_object('ok', false, 'code', 'invalid_evidence_path');
  end if;

  -- One active case at a time; duplicate-spam rate limit.
  if exists (
    select 1 from public.verification_cases vc
    where vc.user_id = v_user and vc.status in ('pending','needs_review')
  ) then
    return jsonb_build_object('ok', false, 'code', 'case_already_pending');
  end if;
  if (
    select count(*) from public.verification_cases vc
    where vc.user_id = v_user and vc.created_at > now() - interval '24 hours'
  ) >= 5 then
    return jsonb_build_object('ok', false, 'code', 'too_many_submissions');
  end if;

  insert into public.verification_cases (
    user_id, verification_type, status, provider, evidence_path, submitted_at
  ) values (
    v_user, p_verification_type, 'pending', 'mort_staff_review', p_evidence_path, now()
  );

  update public.profiles
  set verification_status = 'pending', updated_at = now()
  where id = v_user;

  insert into public.admin_audit_log (actor_id, action, target_type, target_id, reason, metadata)
  values (
    v_user, 'verification_evidence_submitted', 'verification_case', p_evidence_path, null,
    jsonb_build_object('verification_type', p_verification_type, 'age_band',
      case when v_age between 13 and 17 then 'minor' else 'adult' end)
  );

  return jsonb_build_object('ok', true, 'status', 'pending');
end;
$fn$;

create or replace function public.list_my_verification_cases_v1()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $fn$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', vc.id,
        'verification_type', vc.verification_type,
        'status', vc.status,
        'submitted_at', vc.submitted_at,
        'reviewed_at', vc.reviewed_at
      ) order by vc.created_at desc
    ),
    '[]'::jsonb
  )
  from public.verification_cases vc
  where vc.user_id = (select auth.uid());
$fn$;

-- ---------------------------------------------------------------
-- 3. Live-flow status functions (website + mobile app)
-- ---------------------------------------------------------------
create or replace function public.get_my_verification_requirements_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $fn$
declare
  v_user_id uuid := auth.uid();
  v_dob date;
  v_age integer;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'authentication_required');
  end if;

  select p.date_of_birth into v_dob
  from public.profiles p
  where p.id = v_user_id;

  if v_dob is null then
    return jsonb_build_object(
      'ok', true, 'eligible', false, 'code', 'dob_required',
      'minimum_age', 13, 'verification_available', true
    );
  end if;

  v_age := private.mort_age_years(v_dob);
  if v_age < 13 then
    return jsonb_build_object(
      'ok', true, 'eligible', false, 'code', 'minimum_age_required',
      'minimum_age', 13, 'verification_available', false
    );
  end if;

  if v_age between 13 and 17 then
    return jsonb_build_object(
      'ok', true,
      'eligible', true,
      'age_band', 'minor',
      'minimum_age', 13,
      'school_email_required', true,
      'identity_evidence_options', jsonb_build_array('school_photo_id', 'official_enrollment_confirmation'),
      'identity_evidence_rule', 'Upload a current school-issued photo ID, or official enrollment confirmation if your school has no photo ID. MORT staff review every submission and update your status.',
      'verification_available', true,
      'submissions_enabled', true,
      'provider_status', 'mort_staff_review',
      'documents_collected_by_mort', true
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'eligible', true,
    'age_band', 'adult',
    'minimum_age', 13,
    'school_email_required', false,
    'identity_evidence_options', jsonb_build_array('government_photo_id'),
    'identity_evidence_rule', 'Upload a valid, unexpired government-issued photo ID (driver license, state ID, or passport). MORT staff review every submission and update your status.',
    'verification_available', true,
    'submissions_enabled', true,
    'provider_status', 'mort_staff_review',
    'documents_collected_by_mort', true
  );
end;
$fn$;

create or replace function public.get_my_identity_verification_v2()
returns jsonb
language plpgsql
stable
set search_path = ''
as $fn$
declare
  v_user uuid := auth.uid();
  v_role public.mort_role;
  v_status text;
  v_dob date;
  v_minor boolean;
  v_case public.verification_cases%rowtype;
begin
  if v_user is null then
    raise exception using
      errcode = '42501',
      message = 'authentication_required';
  end if;

  select p.role, p.verification_status, p.date_of_birth
    into v_role, v_status, v_dob
  from public.profiles p
  where p.id = v_user;

  select * into v_case from public.verification_cases vc
  where vc.user_id = v_user
  order by vc.created_at desc
  limit 1;

  v_minor := v_dob is not null and private.mort_age_years(v_dob) between 13 and 17;

  return jsonb_build_object(
    'ok', true,
    'id', v_user,
    'role', v_role,
    'status', coalesce(v_status, 'not_started'),
    'evidence_route', case when v_minor then 'school_id' else 'identity' end,
    'verification_level', case when v_status = 'verified' then 1 else 0 end,
    'marketplace_enabled', true,
    'guardian_mode_optional', true,
    'verification_mode', 'mort_staff_review',
    'production_verified', (v_status = 'verified'),
    'sandbox_eligible', false,
    'test_mode', false,
    'submissions_enabled', true,
    'production_provider_available', true,
    'can_retry', (v_case.id is null or v_case.status in ('rejected','expired')),
    'support_escalation_available', true,
    'documents_collected_by_mort', true,
    'provider', 'mort',
    'provider_reference', v_case.provider,
    'decision_source', case when v_case.id is null then null else 'mort_staff_review' end,
    'failure_code', null,
    'public_message', 'Upload your school ID (teens) or government photo ID (adults). MORT staff review every submission and update your status.',
    'evidence_types', case when v_minor
      then '["school_photo_id","official_enrollment_confirmation"]'::jsonb
      else '["government_photo_id"]'::jsonb end
  );
end;
$fn$;

-- ---------------------------------------------------------------
-- 4. Staff review now syncs the profile status the product reads.
-- ---------------------------------------------------------------
create or replace function public.mort_review_verification_case(
  p_case_id uuid,
  p_status public.mort_verification_status,
  p_note text default null,
  p_expires_at timestamptz default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
begin
  if v_user is null or not private.has_staff_role(array['admin','moderator']::public.mort_role[]) then
    raise exception 'Authorized verification reviewer required';
  end if;
  if p_status not in ('verified'::public.mort_verification_status,
                      'rejected'::public.mort_verification_status,
                      'needs_review'::public.mort_verification_status,
                      'expired'::public.mort_verification_status) then
    raise exception 'Invalid review outcome';
  end if;

  if p_status = 'verified'::public.mort_verification_status and exists (
    select 1
    from public.verification_cases vc
    join public.profiles profile on profile.id = vc.user_id
    where vc.id = p_case_id
      and (
        profile.date_of_birth is null
        or extract(year from age(current_date, profile.date_of_birth)) < 13
      )
  ) then
    raise exception 'minimum_age_verification_required';
  end if;

  select vc.user_id into v_owner from public.verification_cases vc where vc.id = p_case_id;

  update public.verification_cases
  set status=p_status, reviewer_id=v_user,
      reviewer_note=nullif(btrim(p_note),''),
      reviewed_at=now(), expires_at=p_expires_at, updated_at=now()
  where id=p_case_id;
  if not found then raise exception 'Verification case not found'; end if;

  update public.profiles
  set verification_status = case p_status
        when 'verified' then 'verified'
        when 'rejected' then 'rejected'
        when 'needs_review' then 'pending'
        when 'expired' then 'expired'
      end,
      updated_at = now()
  where id = v_owner;

  insert into public.admin_audit_log(actor_id,action,target_type,target_id,reason,metadata)
  values (v_user,'verification_reviewed','verification_case',p_case_id::text,
          nullif(btrim(p_note),''),jsonb_build_object('status',p_status));
  return p_case_id;
end;
$fn$;
