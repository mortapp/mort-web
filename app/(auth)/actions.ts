'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, safeNext } from '@/lib/site-url'
import { ensureProfile, sanitizeRole } from '@/lib/auth'

function msg(path: string, message: string) { redirect(`${path}${path.includes('?') ? '&' : '?'}message=${encodeURIComponent(message)}`) }

function ageFromDateOfBirth(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null
  const today = new Date()
  let age = today.getUTCFullYear() - year
  if (today.getUTCMonth() + 1 < month || (today.getUTCMonth() + 1 === month && today.getUTCDate() < day)) age -= 1
  return age
}

function checkedSignupDob(formData: FormData, signupPath: string): { dob: string; age: number } {
  const dob = String(formData.get('date_of_birth') || '')
  const age = ageFromDateOfBirth(dob)
  if (age === null) msg(signupPath, 'Enter a valid date of birth.')
  if (age < 13) msg(signupPath, 'MORT is only available to people age 13 or older.')
  return { dob, age }
}

function signupRole(formData: FormData, age: number) {
  if (age < 18) return 'teen'
  const selected = sanitizeRole(formData.get('role'))
  return selected === 'teen' ? 'adult' : selected
}

export async function signUp(formData: FormData) {
  const signupPath = '/signup'
  const { dob, age } = checkedSignupDob(formData, signupPath)
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const role = signupRole(formData, age)
  const displayName = String(formData.get('display_name') || '').trim()
  const next = safeNext(String(formData.get('next') || ''), '/app/teen/jobs')
  const safeSignupPath = `/signup?next=${encodeURIComponent(next)}`
  if (!email || password.length < 6) msg(safeSignupPath, 'Use an email and password with at least 6 characters.')

  const onboardingPath = `/app/onboarding?next=${encodeURIComponent(next)}`
  const redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(onboardingPath)}`
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: { role, display_name: displayName, date_of_birth: dob }
    }
  })
  if (error) {
    if (error.message.includes('MORT_MINIMUM_AGE_REQUIRED')) msg(safeSignupPath, 'MORT is only available to people age 13 or older.')
    msg(safeSignupPath, error.message)
  }
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
  const displayName = String(formData.get('display_name') || '').trim().slice(0, 80)
  let role = sanitizeRole(formData.get('role'))
  let dob = ''

  if (source === 'signup') {
    const checked = checkedSignupDob(formData, `/signup?next=${encodeURIComponent(next)}`)
    dob = checked.dob
    role = signupRole(formData, checked.age)
  }

  const callbackUrl = new URL(`${getSiteUrl()}/auth/callback`)
  callbackUrl.searchParams.set('next', next)
  if (source === 'signup') {
    callbackUrl.searchParams.set('source', 'signup')
    callbackUrl.searchParams.set('signup_dob', dob)
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
