'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

function v(fd: FormData, k: string) { const x = fd.get(k); return x == null ? null : String(x).trim() }

async function assertGuardianOwnsApplication(supabase: any, guardianId: string, applicationId: string) {
  const { data: app } = await supabase
    .from('applications')
    .select('id, teen_id, status')
    .eq('id', applicationId)
    .maybeSingle()
  if (!app) return { app: null, error: 'Application not found.' }

  const { data: connection } = await supabase
    .from('guardian_connections')
    .select('id, status')
    .eq('guardian_id', guardianId)
    .eq('teen_id', app.teen_id)
    .maybeSingle()

  if (!connection || connection.status !== 'active') {
    return { app: null, error: 'This teen is not connected to your guardian account.' }
  }
  if (app.status !== 'guardian_pending') {
    return { app: null, error: 'This application is not waiting on guardian approval.' }
  }
  return { app, error: null }
}

export async function approveApplication(formData: FormData) {
  const { supabase, user } = await requireRole(['guardian', 'admin'])
  const application_id = v(formData, 'application_id')
  if (!application_id) redirect('/app/guardian?message=' + encodeURIComponent('Missing application.'))

  const { error: checkError } = await assertGuardianOwnsApplication(supabase, user.id, application_id!)
  if (checkError) redirect('/app/guardian?message=' + encodeURIComponent(checkError))

  // Approving moves it forward into the normal review flow — the same status
  // a submission gets when no guardian approval is required.
  const { data, error } = await supabase.rpc('update_application_status_v3', {
    p_application_id: application_id,
    p_action: 'adult_review',
    p_client_request_id: crypto.randomUUID(),
    p_expected_updated_at: null,
  })
  if (error) redirect('/app/guardian?message=' + encodeURIComponent(error.message))
  if (!data?.ok) redirect('/app/guardian?message=' + encodeURIComponent(data?.message || data?.code || 'Application was not approved.'))

  revalidatePath('/app/guardian')
  revalidatePath('/app/teen/applications')
  redirect('/app/guardian?message=' + encodeURIComponent('Application approved and sent to the job poster.'))
}

export async function rejectApplication(formData: FormData) {
  const { supabase, user } = await requireRole(['guardian', 'admin'])
  const application_id = v(formData, 'application_id')
  if (!application_id) redirect('/app/guardian?message=' + encodeURIComponent('Missing application.'))

  const { error: checkError } = await assertGuardianOwnsApplication(supabase, user.id, application_id!)
  if (checkError) redirect('/app/guardian?message=' + encodeURIComponent(checkError))

  const { data, error } = await supabase.rpc('update_application_status_v3', {
    p_application_id: application_id,
    p_action: 'guardian_rejected',
    p_client_request_id: crypto.randomUUID(),
    p_expected_updated_at: null,
  })
  if (error) redirect('/app/guardian?message=' + encodeURIComponent(error.message))
  if (!data?.ok) redirect('/app/guardian?message=' + encodeURIComponent(data?.message || data?.code || 'Application was not rejected.'))

  revalidatePath('/app/guardian')
  revalidatePath('/app/teen/applications')
  redirect('/app/guardian?message=' + encodeURIComponent('Application rejected.'))
}

// Pausing blocks a connected teen from applying to new jobs or starting new
// message threads (see the check in app/app/teen/actions.ts applyToJob and
// app/app/messages/actions.ts startThreadFromApplication) — it does NOT
// block safety pings, since a paused teen should still be able to send an
// SOS. This is intentionally narrower than a full account lock.
export async function setTeenPaused(formData: FormData) {
  const { supabase, user } = await requireRole(['guardian', 'admin'])
  const teen_id = v(formData, 'teen_id')
  const paused = v(formData, 'paused') === 'true'
  if (!teen_id) redirect('/app/guardian?message=' + encodeURIComponent('Missing teen.'))

  const { data: connection } = await supabase
    .from('guardian_connections')
    .select('id, status')
    .eq('guardian_id', user.id)
    .eq('teen_id', teen_id)
    .maybeSingle()

  if (!connection || connection.status !== 'active') {
    redirect('/app/guardian?message=' + encodeURIComponent('This teen is not connected to your guardian account.'))
  }

  const { error } = await supabase.from('teen_profiles').update({ paused_by_guardian: paused }).eq('user_id', teen_id)
  if (error) redirect('/app/guardian?message=' + encodeURIComponent(error.message))

  revalidatePath('/app/guardian')
  redirect('/app/guardian?message=' + encodeURIComponent(paused ? 'Teen account paused — they can\'t apply to new jobs or start new chats until resumed.' : 'Teen account resumed.'))
}
