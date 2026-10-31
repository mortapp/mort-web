'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser, sanitizeRole } from '@/lib/auth'
import { safeNext } from '@/lib/site-url'

function val(fd: FormData, key: string) { const v = fd.get(key); return v == null ? null : String(v).trim() }

function destinationForRole(role: string, requested: string | null) {
  const fallbacks: Record<string, string> = { teen: '/app/teen/jobs', adult: '/app/adult', guardian: '/app/guardian', admin: '/app/admin' }
  const fallback = fallbacks[role] || '/app'
  const next = safeNext(requested, fallback)
  const allowedPrefix: Record<string, string> = { teen: '/app/teen/', adult: '/app/adult', guardian: '/app/guardian', admin: '/app/admin' }
  return next.startsWith(allowedPrefix[role] || '/app') ? next : fallback
}

export async function saveOnboarding(formData: FormData) {
  const { supabase, user, profile } = await requireUser()
  if (profile?.role === 'admin') redirect('/app/admin?message=' + encodeURIComponent('Admin accounts are managed directly in Supabase, not through onboarding.'))

  // This form is reachable at any time after onboarding too ("update your
  // info below"), not just once. Everything below is written so that
  // resubmitting it to fix a typo in your city can never silently undo a
  // safety control someone else set: role selection can change only before
  // onboarding is completed. After that, the existing role is kept, matching
  // the same rule used in app/app/verify/actions.ts.
  const isFirstTime = !profile?.onboarding_completed_at
  const role = isFirstTime ? sanitizeRole(val(formData,'role') || profile?.role) : profile?.role
  const display_name = val(formData,'display_name') || user.email?.split('@')[0] || 'MORT User'
  const dateOfBirth = val(formData,'dob') || null
  const city = val(formData,'city') || null
  const region = val(formData,'state') || null
  const username = val(formData,'username') || null
  if (username && !/^[a-z0-9_]{3,24}$/.test(username)) {
    redirect('/app/onboarding?message=' + encodeURIComponent('Username must be 3–24 characters using lowercase letters, numbers, or underscores.'))
  }
  const skills = role === 'teen'
    ? String(formData.get('skills') || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 20)
    : []

  // Match the active production profiles schema. Keep the account pending
  // and verification not_started; onboarding must not bypass release gates.
  const profilePatch: Record<string, unknown> = {
    id: user.id,
    role,
    display_name,
    date_of_birth: dateOfBirth,
    city,
    region,
    username,
    bio: role === 'teen' ? (val(formData, 'bio') || null) : null,
    preferred_job_categories: skills,
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from('profiles').upsert(profilePatch, { onConflict: 'id' })
  if (error) redirect(`/app/onboarding?message=${encodeURIComponent(error.message)}`)

  revalidatePath('/app','layout')
  const destination = destinationForRole(role, val(formData, 'next'))
  const message = role === 'teen' ? 'Welcome to MORT! Start browsing jobs.' : role === 'adult' ? 'Onboarding saved. Verify your business to start posting jobs.' : 'Onboarding saved. Connect your teen to get started.'
  redirect(`${destination}${destination.includes('?') ? '&' : '?'}message=${encodeURIComponent(message)}`)
}

export async function saveProfile(formData: FormData) {
  const { supabase, user } = await requireUser()
  const username = val(formData,'username') || null
  if (username && !/^[a-z0-9_]{3,24}$/.test(username)) {
    redirect('/app/profile?message=' + encodeURIComponent('Username must be 3–24 characters using lowercase letters, numbers, or underscores.'))
  }
  const { error } = await supabase.from('profiles').update({
    display_name: val(formData,'display_name'), username, city: val(formData,'city'), region: val(formData,'state'), date_of_birth: val(formData,'dob') || null, updated_at: new Date().toISOString()
  }).eq('id', user.id)
  if (error) redirect(`/app/profile?message=${encodeURIComponent(error.message)}`)
  revalidatePath('/app','layout')
  redirect('/app/profile?message=Profile saved')
}

export async function savePaymentPreference() {
  await requireUser()
  redirect('/app/payments?message=' + encodeURIComponent('Payment preference saving is temporarily disabled because the live backend has no safe payment-preference RPC yet. MORT still does not process, move, hold, or guarantee payments.'))
}

export async function createReport(formData: FormData) {
  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('reports').insert({ reporter_id: user.id, target_user_id: val(formData,'target_user_id') || null, target_job_id: val(formData,'target_job_id') || null, target_message_id: val(formData,'target_message_id') || null, reason: val(formData,'reason') || 'Safety concern', details: val(formData,'details'), status: 'open' })
  if (error) redirect(`/app/reports/new?message=${encodeURIComponent(error.message)}`)
  redirect('/app/safety?message=Report submitted')
}
