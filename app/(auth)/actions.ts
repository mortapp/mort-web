'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, safeNext } from '@/lib/site-url'
import { ensureProfile, sanitizeRole } from '@/lib/auth'

function msg(path: string, message: string) { redirect(`${path}${path.includes('?') ? '&' : '?'}message=${encodeURIComponent(message)}`) }

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const role = sanitizeRole(formData.get('role'))
  const displayName = String(formData.get('display_name') || '').trim()
  const next = safeNext(String(formData.get('next') || ''), '/app/teen/jobs')
  const signupPath = `/signup?next=${encodeURIComponent(next)}`
  if (!email || password.length < 6) msg(signupPath, 'Use an email and password with at least 6 characters.')

  const onboardingPath = `/app/onboarding?next=${encodeURIComponent(next)}`
  const redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(onboardingPath)}`
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo, data: { role, display_name: displayName } }
  })
  if (error) msg(signupPath, error.message)
  if (data.user && data.session) {
    await ensureProfile(supabase, data.user, role)
    revalidatePath('/', 'layout')
    redirect(onboardingPath)
  }
  msg('/login', 'Check your email to verify your account. The link should go to your Vercel site, not localhost.')
}

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const next = safeNext(String(formData.get('next') || ''), '/app')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) msg('/login', error.message)
  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient()
  const source = String(formData.get('source') || 'login') === 'signup' ? 'signup' : 'login'
  const next = safeNext(String(formData.get('next') || ''), '/app')
  const roleInput = formData.get('role')
  const role = sanitizeRole(roleInput)
  const displayName = String(formData.get('display_name') || '').trim().slice(0, 80)

  const callbackUrl = new URL(`${getSiteUrl()}/auth/callback`)
  callbackUrl.searchParams.set('next', next)
  if (source === 'signup') {
    callbackUrl.searchParams.set('role', role)
    if (displayName) callbackUrl.searchParams.set('display_name', displayName)
  }

  const fallbackPath = source === 'signup'
    ? `/signup?next=${encodeURIComponent(next)}`
    : `/login?next=${encodeURIComponent(next)}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl.toString() }
  })

  if (error) msg(fallbackPath, error.message)
  if (!data?.url) msg(fallbackPath, 'Google sign-in is not configured yet. Check Supabase Auth provider settings.')
  redirect(data.url)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login?message=Signed out')
}

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${getSiteUrl()}/auth/callback?next=/update-password` })
  if (error) msg('/reset-password', error.message)
  msg('/login', 'Password reset email sent.')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = String(formData.get('password') || '')
  if (password.length < 6) msg('/update-password', 'Password must be at least 6 characters.')
  const { error } = await supabase.auth.updateUser({ password })
  if (error) msg('/update-password', error.message)
  msg('/app/profile', 'Password updated.')
}
