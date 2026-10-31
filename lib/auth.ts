import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Role = 'teen' | 'adult' | 'guardian' | 'admin'
type SelfAssignableRole = 'teen' | 'adult' | 'guardian'

// Used only to sanitize signup form metadata for compatibility with the
// existing signup UI. This value is never used to authorize or assign a
// production profile role; the onboarding RPC derives role from date of birth.
export function sanitizeRole(input: unknown): SelfAssignableRole {
  return input === 'adult' || input === 'guardian' || input === 'teen'
    ? input
    : 'teen'
}

function hasSupabaseAuthCookie(items: { name: string }[]) {
  return items.some((c) => c.name.startsWith('sb-') || c.name.includes('auth-token'))
}

/**
 * The auth trigger creates a pending profile. The production bootstrap RPC only
 * fills a missing row and never assigns a role, changes account status, or
 * overwrites user data. Signup metadata is deliberately not used for authz.
 */
export async function ensureProfile(supabase: any, _user: any, _role?: unknown, _displayName?: unknown) {
  const { error } = await supabase.rpc('ensure_my_profile')
  if (error) throw error
}

export async function getSessionProfile() {
  const cookieStore = await cookies()
  const hasAuth = hasSupabaseAuthCookie(cookieStore.getAll())
  const supabase = await createClient()

  // Avoid build-time network calls during static analysis.
  if (!hasAuth) return { supabase, user: null, profile: null }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, profile: null }

  await ensureProfile(supabase, user)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  return { supabase, user, profile }
}

export async function requireUser() {
  const ctx = await getSessionProfile()
  if (!ctx.user) redirect('/login?message=Sign in first')
  if (ctx.profile?.account_status === 'suspended') {
    await ctx.supabase.auth.signOut()
    redirect('/login?message=' + encodeURIComponent('This account has been suspended. Contact MORT support if you think this is a mistake.'))
  }
  return ctx as { supabase: any; user: any; profile: any }
}

export async function requireRole(roles: Role[]) {
  const ctx = await requireUser()
  if (!ctx.profile?.role || !roles.includes(ctx.profile.role)) {
    redirect('/app/onboarding?message=Complete account setup first')
  }
  // A completed onboarding record does not activate a pending account.
  // Keep every role-protected dashboard behind the independent account gate.
  if (ctx.profile.role !== 'admin' && ctx.profile.account_status !== 'active') {
    redirect('/app/onboarding?message=' + encodeURIComponent('Your account is pending review. Marketplace access is not enabled yet.'))
  }
  return ctx
}

export function isVerifiedEnough(profile: any) {
  return profile?.verification_status === 'approved'
}
