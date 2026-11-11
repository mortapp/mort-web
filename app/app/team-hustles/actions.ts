'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'

function v(fd: FormData, k: string) { const raw = fd.get(k); return raw == null ? null : String(raw).trim() }
function rpcText(data: any, fallback = 'The backend rejected this request.') { return data?.message || data?.code || fallback }

export async function createTeamHustle(formData: FormData) {
  const { supabase } = await requireUser()
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
  if (error) redirect(`/app/team-hustles?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?message=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent('Team hustle posted. Teens can now request to join.'))
}

export async function joinTeamHustle(formData: FormData) {
  const { supabase } = await requireUser()
  const hustleId = String(formData.get('hustle_id') || '')
  const { data, error } = await supabase.rpc('join_team_hustle_v1', { p_hustle_id: hustleId })
  if (error) redirect(`/app/team-hustles?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?message=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent('You joined this team hustle.'))
}

export async function leaveTeamHustle(formData: FormData) {
  const { supabase } = await requireUser()
  const hustleId = String(formData.get('hustle_id') || '')
  const { data, error } = await supabase.rpc('leave_team_hustle_v1', { p_hustle_id: hustleId })
  if (error) redirect(`/app/team-hustles?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?message=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent('You left this team hustle.'))
}

export async function closeTeamHustle(formData: FormData) {
  const { supabase } = await requireUser()
  const hustleId = String(formData.get('hustle_id') || '')
  const { data, error } = await supabase.rpc('close_team_hustle_v1', { p_hustle_id: hustleId })
  if (error) redirect(`/app/team-hustles?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/team-hustles?message=${encodeURIComponent(rpcText(data))}`)
  revalidatePath('/app/team-hustles')
  redirect('/app/team-hustles?message=' + encodeURIComponent('Team hustle closed.'))
}
