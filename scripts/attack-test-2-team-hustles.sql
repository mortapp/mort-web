-- ATTACK TEST 2: team hustles
begin;

create temp table attack_results (attack text, outcome text);
grant all on attack_results to authenticated;

insert into auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values
  ('22222222-2222-4222-8222-2222222222b1', 'hustle-adult@test.invalid', now(), now(), now(), '{"date_of_birth":"1990-01-01"}'::jsonb),
  ('22222222-2222-4222-8222-2222222222b2', 'hustle-teen16@test.invalid', now(), now(), now(), '{"date_of_birth":"2010-06-01"}'::jsonb),
  ('22222222-2222-4222-8222-2222222222b3', 'hustle-teen15@test.invalid', now(), now(), now(), '{"date_of_birth":"2011-06-01"}'::jsonb),
  ('22222222-2222-4222-8222-2222222222b4', 'hustle-teen17@test.invalid', now(), now(), now(), '{"date_of_birth":"2009-06-01"}'::jsonb);

insert into public.profiles (id, role, date_of_birth, display_name)
values
  ('22222222-2222-4222-8222-2222222222b1', 'adult', '1990-01-01', 'Hustle Adult'),
  ('22222222-2222-4222-8222-2222222222b2', 'teen', '2010-06-01', 'Hustle Teen 16'),
  ('22222222-2222-4222-8222-2222222222b3', 'teen', '2011-06-01', 'Hustle Teen 15'),
  ('22222222-2222-4222-8222-2222222222b4', 'teen', '2009-06-01', 'Hustle Teen 17')
on conflict (id) do update set role = excluded.role, date_of_birth = excluded.date_of_birth;

-- ---------------------------------------------------------------
-- LEGIT FLOW: adult creates a hustle
-- ---------------------------------------------------------------
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b1','role','authenticated')::text, true);
set local role authenticated;

do $blk$
declare v_out jsonb;
begin
  v_out := public.create_team_hustle_v1('Fall leaf cleanup crew',
    'Rake and bag leaves at the park entrance; gloves provided.',
    'yard work', 'per_person', 25, 3, 'Indianapolis', 'in', 'Meet at north gate');
  insert into attack_results values ('L1 adult posts team hustle (legit)',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 1: teen tries to post a hustle (role forgery attempt)
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b2','role','authenticated')::text, true);
do $blk$
declare v_out jsonb;
begin
  v_out := public.create_team_hustle_v1('Teen hustle takeover',
    'Teens posting their own crew jobs to bypass adult oversight.',
    'yard work', 'per_person', 25, 3, 'Indianapolis', 'in', null);
  insert into attack_results values ('A1 teen posts team hustle',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 2: teen forges JWT sub to the adult (claims tampering)
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b1','role','authenticated')::text, true);
-- note: in real life the JWT is signed by Supabase; here we emulate a stolen-sub
-- call where the teen claims to be the adult - RPCs trust auth.uid(), which is
-- what a signed JWT provides. This tests the RPC logic only trusts auth.uid().
do $blk$
declare v_out jsonb;
begin
  v_out := public.create_team_hustle_v1('Hustle hijack attempt',
    'Attempt to act as another user via claims tampering.',
    'yard work', 'per_person', 25, 3, 'Indianapolis', 'in', null);
  insert into attack_results values ('A2 claims-tamper post (acts as adult sub)',
    case when (v_out->>'ok')::boolean then 'WORKS AS CLAIMED USER (JWT signature is the only guard - expected)' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- restore teen
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b2','role','authenticated')::text, true);

-- ATTACK 3: teen tries direct INSERT into team_hustles (RLS bypass)
do $blk$
begin
  insert into public.team_hustles (poster_id, title, description)
  values ('22222222-2222-4222-8222-2222222222b2', 'Direct insert hustle', 'RLS bypass attempt data');
  insert into attack_results values ('A3 direct INSERT into team_hustles', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A3 direct INSERT into team_hustles', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 4: teen tries direct INSERT into team_hustle_members
do $blk$
declare v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  insert into public.team_hustle_members (hustle_id, user_id)
  values (v_hustle, '22222222-2222-4222-8222-2222222222b2');
  insert into attack_results values ('A4 direct INSERT into team_hustle_members', 'SUCCEEDED - VULNERABLE');
exception when others then
  insert into attack_results values ('A4 direct INSERT into team_hustle_members', 'BLOCKED: ' || sqlerrm);
end $blk$;

-- ATTACK 5: adult (non-teen) tries to join a hustle
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b1','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  v_out := public.join_team_hustle_v1(v_hustle);
  insert into attack_results values ('A5 adult joins team hustle',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- LEGIT FLOW: teen joins
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b2','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  v_out := public.join_team_hustle_v1(v_hustle);
  insert into attack_results values ('L2 teen joins team hustle (legit)',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 6: duplicate join (spam)
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  v_out := public.join_team_hustle_v1(v_hustle);
  insert into attack_results values ('A6 duplicate join',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 7: poster joins own hustle
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b1','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  v_out := public.join_team_hustle_v1(v_hustle);
  insert into attack_results values ('A7 poster joins own hustle',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 8: teen closes someone else's hustle
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b2','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  v_out := public.close_team_hustle_v1(v_hustle);
  insert into attack_results values ('A8 teen closes another poster hustle',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 9: leave a hustle you never joined
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b4','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  v_out := public.leave_team_hustle_v1(v_hustle);
  insert into attack_results values ('A9 leave without membership',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 10: capacity bypass - fill hustle then join again
-- hustle has workers_needed=3, one member joined; add 2 more as superuser-side via RPC as other teens
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b3','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  v_out := public.join_team_hustle_v1(v_hustle);
  insert into attack_results values ('L3 second teen joins (legit)',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b4','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles limit 1;
  v_out := public.join_team_hustle_v1(v_hustle);
  insert into attack_results values ('L4 third teen joins (fills 3 spots)',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 11: fourth join should be rejected (capacity)
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b1','role','authenticated')::text, true);
do $blk$
-- create a second hustle with 2 spots, fill with 2 teens, then a 3rd tries
declare v_out jsonb; v_hustle uuid;
begin
  v_out := public.create_team_hustle_v1('Small crew test',
    'Capacity enforcement test hustle with two spots only.',
    'yard work', 'total_split', 40, 2, 'Indianapolis', 'in', null);
  select id into v_hustle from public.team_hustles where title = 'Small crew test';
end $blk$;
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b2','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles where title = 'Small crew test';
  v_out := public.join_team_hustle_v1(v_hustle);
  insert into attack_results values ('L5 teen fills spot 1 of small crew',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b3','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles where title = 'Small crew test';
  v_out := public.join_team_hustle_v1(v_hustle);
  insert into attack_results values ('A11 join over capacity (3rd of 2 spots)',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 12: posting rate limit - pre-create 5 hustles as superuser for the adult, then try to post
-- (switch back to superuser to seed rows)
set local role postgres;
select set_config('request.jwt.claims', '', true);
insert into public.team_hustles (poster_id, title, description, workers_needed)
select '22222222-2222-4222-8222-2222222222b1', 'Spam seed ' || g, 'Spam seeding hustle for rate limit test', 2
from generate_series(1,5) g;

select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b1','role','authenticated')::text, true);
set local role authenticated;
do $blk$
declare v_out jsonb;
begin
  v_out := public.create_team_hustle_v1('Sixth hustle today',
    'This post should be rejected by the daily rate limit.',
    'yard work', 'per_person', 25, 3, 'Indianapolis', 'in', null);
  insert into attack_results values ('A12 sixth hustle post in 24h (rate limit)',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- ATTACK 13: garbage/huge payloads
do $blk$
declare v_out jsonb;
begin
  v_out := public.create_team_hustle_v1('x', 'short', null, 'per_person', 25, 3, 'Indianapolis', 'in', null);
  insert into attack_results values ('A13 undersized title/description',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;
do $blk$
declare v_out jsonb;
begin
  v_out := public.create_team_hustle_v1('Negative pay hustle', 'Trying to post a hustle with negative pay amount.',
    'yard work', 'per_person', -50, 3, 'Indianapolis', 'in', null);
  insert into attack_results values ('A14 negative pay amount',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;
do $blk$
declare v_out jsonb;
begin
  v_out := public.create_team_hustle_v1('Eleven workers hustle', 'Trying to require eleven workers.',
    'yard work', 'per_person', 25, 11, 'Indianapolis', 'in', null);
  insert into attack_results values ('A15 workers_needed over max',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;
do $blk$
declare v_out jsonb;
begin
  v_out := public.create_team_hustle_v1('Bad pay type hustle', 'Trying an unknown pay type.',
    'yard work', 'free_money', 25, 3, 'Indianapolis', 'in', null);
  insert into attack_results values ('A16 invalid pay type',
    case when (v_out->>'ok')::boolean then 'SUCCEEDED - VULNERABLE' else 'BLOCKED: ' || (v_out->>'code') end);
end $blk$;

-- LEGIT FLOW: adult closes own hustle
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b1','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles where title = 'Fall leaf cleanup crew';
  v_out := public.close_team_hustle_v1(v_hustle);
  insert into attack_results values ('L6 poster closes own hustle (legit)',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;

-- LEGIT FLOW: teen leaves hustle
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b3','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_hustle uuid;
begin
  select id into v_hustle from public.team_hustles where title = 'Fall leaf cleanup crew';
  v_out := public.leave_team_hustle_v1(v_hustle);
  insert into attack_results values ('L7 teen leaves hustle (legit)',
    case when (v_out->>'ok')::boolean then 'WORKS' else 'BROKEN: ' || (v_out->>'code') end);
end $blk$;

-- LEGIT FLOW: listing returns hustles with member metadata
select set_config('request.jwt.claims',
  json_build_object('sub','22222222-2222-4222-8222-2222222222b3','role','authenticated')::text, true);
do $blk$
declare v_out jsonb; v_count int;
begin
  v_out := public.list_team_hustles_v1();
  select jsonb_array_length(v_out) into v_count;
  insert into attack_results values ('L8 list_team_hustles_v1 returns rows',
    case when v_count > 0 then 'WORKS (' || v_count || ' rows)' else 'BROKEN (0 rows)' end);
end $blk$;

select attack, outcome from attack_results order by attack;

rollback;
