'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser, sanitizeRole } from '@/lib/auth'
import { safeNext } from '@/lib/site-url'

function toBool(v: FormDataEntryValue | null) { return v === 'on' || v === 'true' || v === 'yes' }
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
  // the same rule used in app/app/verify/actions.ts. Guardian pause /
  // guardian-approval-required flags are only ever defaulted on first-time
  // creation, never reset on a later save.
  const isFirstTime = !profile?.onboarding_completed
  const role = isFirstTime ? sanitizeRole(val(formData,'role') || profile?.role) : profile?.role
  const display_name = val(formData,'display_name') || user.email?.split('@')[0] || 'MORT User'
  const dob = val(formData,'dob') || null
  const city = val(formData,'city') || null
  const state = val(formData,'state') || null
  const username = val(formData,'username') || null

  const profilePatch: Record<string, unknown> = {
    id: user.id, role, display_name, dob, city, state, username,
    onboarding_completed: true, updated_at: new Date().toISOString(),
  }
  if (isFirstTime) {
    profilePatch.account_status = 'active'
    profilePatch.verification_status = 'not_started'
    profilePatch.payment_preference = 'none'
  }
  const { error } = await supabase.from('profiles').upsert(profilePatch)
  if (error) redirect(`/app/onboarding?message=${encodeURIComponent(error.message)}`)

  if (role === 'teen') {
    const skills = String(formData.get('skills') || '').split(',').map(s=>s.trim()).filter(Boolean)
    const teenPatch: Record<string, unknown> = { user_id: user.id, bio: val(formData,'bio'), skills, school_year: val(formData,'school_year') }
    if (isFirstTime) {
      teenPatch.guardian_approval_required = toBool(formData.get('guardian_required'))
      teenPatch.paused_by_guardian = false
    }
    await supabase.from('teen_profiles').upsert(teenPatch)
  }
  if (role === 'adult') await supabase.from('adult_profiles').upsert({ user_id: user.id, business_name: val(formData,'business_name'), business_type: val(formData,'business_type') })
  if (role === 'guardian') await supabase.from('guardian_profiles').upsert({ user_id: user.id, emergency_contact_name: val(formData,'emergency_contact_name'), emergency_contact_phone: val(formData,'emergency_contact_phone') })

  revalidatePath('/app','layout')
  const destination = destinationForRole(role, val(formData, 'next'))
  const message = role === 'teen' ? 'Welcome to MORT! Start browsing jobs.' : role === 'adult' ? 'Onboarding saved. Verify your business to start posting jobs.' : 'Onboarding saved. Connect your teen to get started.'
  redirect(`${destination}${destination.includes('?') ? '&' : '?'}message=${encodeURIComponent(message)}`)
}

export async function saveProfile(formData: FormData) {
  const { supabase, user } = await requireUser()
  const { error } = await supabase.from('profiles').update({
    display_name: val(formData,'display_name'), username: val(formData,'username'), city: val(formData,'city'), state: val(formData,'state'), dob: val(formData,'dob') || null, updated_at: new Date().toISOString()
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
