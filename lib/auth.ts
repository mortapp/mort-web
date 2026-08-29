import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Role = 'teen' | 'adult' | 'guardian' | 'admin'

// Admin is never assignable from any client-supplied value — not the signup
// form, not the onboarding form, not Supabase Auth user_metadata (which is
// itself client-settable at signup time). It can only be granted by editing
// the profiles table directly in Supabase. Every code path that writes
// profiles.role from user input must go through this first.
const SELF_ASSIGNABLE_ROLES = ['teen', 'adult', 'guardian'] as const
export type SelfAssignableRole = typeof SELF_ASSIGNABLE_ROLES[number]
export function sanitizeRole(input: unknown): SelfAssignableRole {
  return (SELF_ASSIGNABLE_ROLES as readonly string[]).includes(input as string)
    ? (input as SelfAssignableRole)
    : 'teen'
}

function hasSupabaseAuthCookie(items: { name: string }[]) {
  return items.some((c) => c.name.startsWith('sb-') || c.name.includes('auth-token'))
}

export async function ensureProfile(supabase: any, user: any, role?: unknown, displayNameOverride?: unknown) {
  const metadata = user?.user_metadata || {}
  const desiredRole = sanitizeRole(role || metadata.role)
  const suppliedDisplayName = typeof displayNameOverride === 'string' ? displayNameOverride.trim().slice(0, 80) : ''
  const displayName = suppliedDisplayName || metadata.display_name || metadata.full_name || metadata.name || user?.email?.split('@')[0] || 'MORT User'

  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!existing) {
    await supabase.from('profiles').insert({
      id: user.id,
      role: desiredRole,
      display_name: displayName,
      onboarding_completed: false,
      account_status: 'active',
      verification_status: 'not_started',
      payment_preference: 'none'
    })
  } else {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    // Only ever fills a NULL role — never overwrites an existing one. This
    // is also what keeps an existing admin's role untouched: their role is
    // already set, so this branch never fires for them.
    if (!existing.role) patch.role = desiredRole
    if (!existing.display_name) patch.display_name = displayName
    await supabase.from('profiles').update(patch).eq('id', user.id)
  }
}

export async function getSessionProfile() {
  const cookieStore = await cookies()
  const hasAuth = hasSupabaseAuthCookie(cookieStore.getAll())
  const supabase = await createClient()

  // During Vercel/Next static analysis there is no request auth cookie. Avoid a build-time
  // network call to Supabase Auth and let protected routes redirect normally at request time.
  if (!hasAuth) return { supabase, user: null, profile: null }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, profile: null }

  await ensureProfile(supabase, user, null)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return { supabase, user, profile }
}

export async function requireUser() {
  const ctx = await getSessionProfile()
  if (!ctx.user) redirect('/login?message=Sign in first')
  // account_status is how admins suspend an account (see app/app/admin/actions.ts
  // updateUserStatus). This is the single gate almost every protected page and
  // server action goes through, so it's enforced once, here — a suspended user
  // is signed out and sent to login rather than silently keeping full access.
  if (ctx.profile?.account_status === 'suspended') {
    await ctx.supabase.auth.signOut()
    redirect('/login?message=' + encodeURIComponent('This account has been suspended. Contact MORT support if you think this is a mistake.'))
  }
  return ctx as { supabase: any; user: any; profile: any }
}

export async function requireRole(roles: Role[]) {
  const ctx = await requireUser()
  if (!ctx.profile?.role || !roles.includes(ctx.profile.role)) {
    redirect('/app/onboarding?message=Choose your MORT role first')
  }
  return ctx
}

export function isVerifiedEnough(profile: any) {
  return profile?.verification_status === 'approved'
}
