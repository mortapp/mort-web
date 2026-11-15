'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'

function v(fd: FormData, k: string) { const raw = fd.get(k); return raw == null ? null : String(raw).trim() }
function rpcText(data: any, fallback = 'The backend rejected this request.') { return data?.message || data?.code || fallback }

export async function createTeamHustle(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (
    profile?.role === 'adult' &&
    !['approved', 'verified'].includes(profile.verification_status || '')
  ) {
    redirect('/app/verify?error=' + encodeURIComponent('Adults must be approved before posting team hustles.'))
  }
  const { data, error } = await supabase.rpc('create_team_hustle_v1', {
    p_title: v(formData, 'title') || '',
    p_description: v(formData, 'description') || '',
    p_category: v(formData, 'category'),
    p_pay_type: v(formData, 'pay_type'),
    p_pay_amount: formData.get('pay_amount') ? Number(formData.get('pay_amount')) : null,
    p_workers_needed: Number(v(formData, 'workers_needed') || 2),
    p_city: v(formData, 'city'),
    p_region: v(formData, 'region'),
    p_location_notes: v(formData, 'location_notes'),
  })
  if (error) redirect(`/app/team-hustles?error=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?error=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent('Team hustle submitted for review. Teens will see it only after approval.'))
}

export async function joinTeamHustle(formData: FormData) {
  const { supabase } = await requireUser()
  const hustleId = String(formData.get('hustle_id') || '')
  const { data, error } = await supabase.rpc('join_team_hustle_v1', { p_hustle_id: hustleId })
  if (error) redirect(`/app/team-hustles?error=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?error=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent('You joined this team hustle.'))
}

export async function leaveTeamHustle(formData: FormData) {
  const { supabase } = await requireUser()
  const hustleId = String(formData.get('hustle_id') || '')
  const { data, error } = await supabase.rpc('leave_team_hustle_v1', { p_hustle_id: hustleId })
  if (error) redirect(`/app/team-hustles?error=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?error=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent('You left this team hustle.'))
}

export async function closeTeamHustle(formData: FormData) {
  const { supabase } = await requireUser()
  const hustleId = String(formData.get('hustle_id') || '')
  const { data, error } = await supabase.rpc('close_team_hustle_v1', { p_hustle_id: hustleId })
  if (error) redirect(`/app/team-hustles?error=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?error=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent('Team hustle closed.'))
}

export async function reviewTeamHustle(formData: FormData) {
  const { supabase, profile } = await requireUser()
  if (profile?.role !== 'admin') {
    redirect('/app/team-hustles?error=' + encodeURIComponent('Administrator access is required.'))
  }
  const hustleId = v(formData, 'hustle_id') || ''
  const decision = v(formData, 'decision')
  const reason = v(formData, 'reason')
  if (decision !== 'approve' && decision !== 'reject') {
    redirect('/app/team-hustles?error=' + encodeURIComponent('Choose approve or reject.'))
  }
  if (decision === 'reject' && (!reason || reason.length < 3)) {
    redirect('/app/team-hustles?error=' + encodeURIComponent('Enter a rejection reason of at least three characters.'))
  }

  const { data, error } = await supabase.rpc('admin_review_team_hustle_v1', {
    p_hustle_id: hustleId,
    p_decision: decision,
    p_reason: reason || null,
  })
  if (error) redirect(`/app/team-hustles?error=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?error=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent(
    decision === 'approve' ? 'Team hustle approved.' : 'Team hustle rejected.'
  ))
}
