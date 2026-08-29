'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
function v(fd: FormData, k: string) { const raw = fd.get(k); return raw == null ? null : String(raw).trim() }
function rpcText(data: any, fallback = 'The backend rejected this request.') { return data?.message || data?.code || fallback }
function roleUpdateIfUnset(currentRole: string | null | undefined, desiredRole: 'teen' | 'adult' | 'guardian') { return currentRole ? {} : { role: desiredRole } }

export async function createGuardianInvite(formData?: FormData) {
  const { supabase, user, profile } = await requireUser()
  await supabase.from('profiles').update({ ...roleUpdateIfUnset(profile?.role, 'teen'), updated_at: new Date().toISOString() }).eq('id', user.id)
  const inviteEmail = formData ? v(formData, 'invite_email') : null
  const { data, error } = await supabase.rpc('create_guardian_invite_v2', { p_invite_email: inviteEmail || null })
  if (error) redirect(`/app/verify?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/verify?message=${encodeURIComponent(rpcText(data, 'Guardian invite could not be created.'))}`)
  revalidatePath('/app/verify')
  redirect(`/app/verify?message=${encodeURIComponent(`Guardian invite code: ${data.invite_code}`)}`)
}

export async function acceptGuardianInvite(formData: FormData) {
  const { supabase, user, profile } = await requireUser()
  await supabase.from('profiles').update({ ...roleUpdateIfUnset(profile?.role, 'guardian'), onboarding_completed: true, updated_at: new Date().toISOString() }).eq('id', user.id)
  await supabase.from('guardian_profiles').upsert({ user_id: user.id })
  const invite_code = String(formData.get('invite_code') || '').trim().toUpperCase()
  if (!invite_code) redirect('/app/verify?message=' + encodeURIComponent('Enter the guardian invite code.'))
  const { error } = await supabase.rpc('accept_guardian_invite', { p_invite_code: invite_code })
  if (error) redirect(`/app/verify?message=${encodeURIComponent(error.message)}`)
  revalidatePath('/app/guardian')
  redirect('/app/guardian?message=Guardian connection accepted')
}

export async function saveTeenVerification(formData: FormData) {
  const { supabase, user, profile } = await requireUser()
  await supabase.from('profiles').update({ ...roleUpdateIfUnset(profile?.role, 'teen'), verification_status: 'pending', updated_at: new Date().toISOString() }).eq('id', user.id)

  // Same rule as app/app/actions.ts saveOnboarding: this form can be
  // resubmitted any time to update bio/skills, so guardian_approval_required
  // and paused_by_guardian are only ever defaulted when the teen_profiles
  // row doesn't exist yet — never reset on a later save, or a teen could
  // clear their own guardian's pause just by resubmitting this form.
  const { data: existingTeenProfile } = await supabase.from('teen_profiles').select('user_id').eq('user_id', user.id).maybeSingle()
  const teenPatch: Record<string, unknown> = { user_id: user.id, bio: v(formData,'bio'), skills: String(formData.get('skills') || '').split(',').map(s=>s.trim()).filter(Boolean), school_year: v(formData,'school_year') }
  if (!existingTeenProfile) {
    teenPatch.guardian_approval_required = formData.get('guardian_approval_required') === 'on'
    teenPatch.paused_by_guardian = false
  }
  await supabase.from('teen_profiles').upsert(teenPatch)
  redirect('/app/verify?message=Teen verification profile submitted for review')
}

export async function submitBusinessVerification(formData: FormData) {
  const { supabase, user, profile } = await requireUser()
  await supabase.from('profiles').update({ ...roleUpdateIfUnset(profile?.role, 'adult'), verification_status: 'pending', updated_at: new Date().toISOString() }).eq('id', user.id)
  await supabase.from('adult_profiles').upsert({ user_id: user.id, business_name: v(formData,'business_name'), business_type: v(formData,'business_type'), verification_notes: v(formData,'notes') })
  const { data, error } = await supabase.rpc('submit_business_verification', {
    p_verification_id: crypto.randomUUID(),
    p_storage_path: '',
    p_business_name: v(formData,'business_name') || 'Adult customer',
    p_business_type: v(formData,'business_type') || 'individual',
    p_notes: v(formData,'notes') || null,
  })
  if (error) redirect(`/app/verify?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/verify?message=${encodeURIComponent(rpcText(data, 'Business verification is not available yet.'))}`)
  redirect('/app/verify?message=Business/adult verification request submitted')
}
