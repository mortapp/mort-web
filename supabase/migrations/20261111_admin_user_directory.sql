-- Admin user directory: lets Admin HQ show the email behind each account.
-- auth.users is not client-readable, so this SECURITY DEFINER RPC is the
-- staff-only bridge. Gated on the admin role via private.has_staff_role.

create or replace function public.mort_admin_list_users_v1(
  p_limit integer default 200)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $fn$
begin
  if not private.has_staff_role(array['admin']::public.mort_role[]) then
    return jsonb_build_object('ok', false, 'code', 'admin_required');
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'email', u.email,
        'display_name', p.display_name,
        'role', p.role,
        'account_status', p.account_status,
        'verification_status', p.verification_status,
        'created_at', p.created_at
      ) order by p.created_at desc
    )
    from (
      select id, display_name, role, account_status, verification_status, created_at
      from public.profiles
      order by created_at desc
      limit least(greatest(coalesce(p_limit, 200), 1), 500)
    ) p
    join auth.users u on u.id = p.id
  ), '[]'::jsonb);
end;
$fn$;
