-- ATTACK TEST 1: profiles + verification backend
-- Runs as simulated authenticated users inside a transaction; rolled back at the end.

begin;

create temp table attack_results (attack text, outcome text);
grant all on attack_results to authenticated;

-- Test identities (rolled back afterwards)
insert into auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values
  ('11111111-1111-4111-8111-1111111111a1', 'attack-adult@test.invalid', now(), now(), now(), '{"date_of_birth":"1990-01-01"}'::jsonb),
  ('11111111-1111-4111-8111-1111111111a2', 'attack-teen16@test.invalid', now(), now(), now(), '{"date_of_birth":"2010-06-01"}'::jsonb),
  ('11111111-1111-4111-8111-1111111111a3', 'attack-teen15@test.invalid', now(), now(), now(), '{"date_of_birth":"2011-06-01"}'::jsonb);

insert into public.profiles (id, role, date_of_birth, display_name)
values
  ('11111111-1111-4111-8111-1111111111a1', 'adult', '1990-01-01', 'Attack Adult'),
  ('11111111-1111-4111-8111-1111111111a2', 'teen', '2010-06-01', 'Attack Teen 16'),
  ('11111111-1111-4111-8111-1111111111a3', 'teen', '2011-06-01', 'Attack Teen 15')
on conflict (id) do update set role = excluded.role, date_of_birth = excluded.date_of_birth;

-- helper to act as a user
-- ---------------------------------------------------------------
-- Run everything as the "adult" attacker first
-- ---------------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub','11111111-1111-4111-8111-1111111111a1','role','authenticated')::text, true);
set local role authenticated;

-- ATTACK 1: self-verification bypass (the original hole)
do $blk$
begin
  update public.profiles set verification_status = 'verified'
  where id = '11111111-1111-4111-8111-1111111111a1';
  insert into attack_results values ('A1 adult flips own verification_status to verified', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A1 adult flips own verification_status to verified', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 2: role forgery (make self admin)
do $blk$
begin
  update public.profiles set role = 'admin'
  where id = '11111111-1111-4111-8111-1111111111a1';
  insert into attack_results values ('A2 adult sets own role to admin', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A2 adult sets own role to admin', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 3: account_status tampering
do $blk$
begin
  update public.profiles set account_status = 'active'
  where id = '11111111-1111-4111-8111-1111111111a1';
  insert into attack_results values ('A3 adult sets own account_status', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A3 adult sets own account_status', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 4: date_of_birth tampering (age-band forgery)
do $blk$
begin
  update public.profiles set date_of_birth = '2010-01-01'
  where id = '11111111-1111-4111-8111-1111111111a1';
  insert into attack_results values ('A4 adult changes own date_of_birth', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A4 adult changes own date_of_birth', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 5: staff review function abuse by non-staff
do $blk$
declare v_case uuid;
begin
  v_case := public.mort_review_verification_case(
    (select id from public.verification_cases limit 1), 'verified', 'hijacked');
  insert into attack_results values ('A5 non-staff calls mort_review_verification_case', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A5 non-staff calls mort_review_verification_case', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 6: direct insert into verification_cases as pending
do $blk$
begin
  insert into public.verification_cases (user_id, verification_type, status, evidence_path)
  values ('11111111-1111-4111-8111-1111111111a1', 'identity', 'pending', 'x.jpg');
  insert into attack_results values ('A6 direct insert pending verification case', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A6 direct insert pending verification case', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 7: read another user's verification cases directly
do $blk$
declare v_count int;
begin
  select count(*) into v_count from public.verification_cases
  where user_id <> '11111111-1111-4111-8111-1111111111a1';
  insert into attack_results values ('A7 read others verification_cases rows: ' || v_count || ' rows',
    case when v_count > 0 then 'SUCCEEDED - VULNERABLE' else 'BLOCKED (0 rows visible)' end);
end $blk$;

-- ATTACK 8: evidence path in ANOTHER user's folder
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('identity',
    '11111111-1111-4111-8111-1111111111a2/00000000-0000-4000-8000-000000000001.jpg');
  insert into attack_results values ('A8 submit evidence into another user folder',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 9: path traversal evidence path
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('identity',
    '11111111-1111-4111-8111-1111111111a1/../../../etc/passwd.jpg');
  insert into attack_results values ('A9 path traversal evidence path',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 10: fake filename (not a UUID)
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('identity',
    '11111111-1111-4111-8111-1111111111a1/fake-name.jpg');
  insert into attack_results values ('A10 non-UUID evidence filename',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 11: uppercase UUID path (case trick)
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('identity',
    '11111111-1111-4111-8111-1111111111a1/11111111-1111-4111-8111-1111111111A1.jpg');
  insert into attack_results values ('A11 uppercase-UUID evidence path',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 12: wrong age band - adult submitting school_id
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('school_id',
    '11111111-1111-4111-8111-1111111111a1/00000000-0000-4000-8000-000000000002.jpg');
  insert into attack_results values ('A12 adult submits school_id (wrong band)',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- LEGIT FLOW 1: adult submits identity evidence correctly
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('identity',
    '11111111-1111-4111-8111-1111111111a1/00000000-0000-4000-8000-00000000000f.jpg');
  insert into attack_results values ('L1 adult submits identity evidence (legit)',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 13: duplicate spam - submit again while pending
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('identity',
    '11111111-1111-4111-8111-1111111111a1/00000000-0000-4000-8000-00000000000e.jpg');
  insert into attack_results values ('A13 duplicate submission while pending',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 14: storage upload into another user's folder
do $blk$
begin
  insert into storage.objects (name, bucket_id, owner)
  values ('11111111-1111-4111-8111-1111111111a2/evil.jpg', 'verification-evidence',
          '11111111-1111-4111-8111-1111111111a1');
  insert into attack_results values ('A14 storage upload into another user folder', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A14 storage upload into another user folder', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ---------------------------------------------------------------
-- Now as the 16-year-old teen
-- ---------------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub','11111111-1111-4111-8111-1111111111a2','role','authenticated')::text, true);

-- ATTACK 15: teen flips own verification status
do $blk$
begin
  update public.profiles set verification_status = 'verified'
  where id = '11111111-1111-4111-8111-1111111111a2';
  insert into attack_results values ('A15 teen flips own verification_status', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A15 teen flips own verification_status', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 16: teen submits adult identity (wrong band)
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('identity',
    '11111111-1111-4111-8111-1111111111a2/00000000-0000-4000-8000-000000000003.jpg');
  insert into attack_results values ('A16 teen submits government ID (wrong band)',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- LEGIT FLOW 2: teen submits school ID
do $blk$
declare v_out jsonb;
begin
  v_out := public.submit_my_verification_evidence_v1('school_id',
    '11111111-1111-4111-8111-1111111111a2/00000000-0000-4000-8000-000000000010.jpg');
  insert into attack_results values ('L2 teen submits school ID (legit)',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 17: list_my_verification_cases leaks other users' cases?
do $blk$
declare v_out jsonb; v_count int;
begin
  v_out := public.list_my_verification_cases_v1();
  select jsonb_array_length(v_out) into v_count;
  select count(*) into v_count from jsonb_array_elements(v_out) el
    where el->>'user_id' is not null and el->>'user_id' <> '11111111-1111-4111-8111-1111111111a2';
  -- function only returns own rows; count rows that are not the caller's by id field
  insert into attack_results values ('A17 case list contains only own cases',
    case when v_count > 0 then 'SUCCEEDED - VULNERABLE' else 'BLOCKED (own rows only)' end);
end $blk$;

-- ATTACK 18: attempt to create a role-teen profile with an adult DOB (as superuser, i.e. best case for attacker)
do $blk$
begin
  insert into auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
  values ('11111111-1111-4111-8111-1111111111a4', 'attack-teen20@test.invalid', now(), now(), now(), '{"date_of_birth":"2006-06-01"}'::jsonb);
  insert into attack_results values ('A18 create role-teen account with adult DOB', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A18 create role-teen account with adult DOB', 'BLOCKED: ' || sqlerrm);
end $blk$;

select attack, outcome from attack_results order by attack;

rollback;
