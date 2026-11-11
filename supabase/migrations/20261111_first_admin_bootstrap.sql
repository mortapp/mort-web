-- First admin bootstrap: kolawoleorelesi@mortapp.org
-- The profiles.role column is no longer writable by clients (column-security
-- migration), so this runs as the database owner. The web requireRole gate
-- exempts role 'admin' from onboarding, DOB and account-status checks.

update public.profiles
set role = 'admin', account_status = 'active', updated_at = now()
where id = '24678b0e-93bb-4604-a387-675268a0fe10'
  and email = 'kolawoleorelesi@mortapp.org';

insert into private.user_roles (user_id, role, granted_by)
values ('24678b0e-93bb-4604-a387-675268a0fe10', 'admin', null)
on conflict (user_id, role) do nothing;
