'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'

function v(fd: FormData, k: string){ const x=fd.get(k); return x==null?null:String(x).trim() }
function rpcText(data: any, fallback = 'The backend rejected this request.') { return data?.message || data?.code || fallback }
function redirectTo(path: string, message: string): never { redirect(`${path}${path.includes('?') ? '&' : '?'}message=${encodeURIComponent(message)}`) }
function redirectError(path: string, message: string): never { redirect(`${path}${path.includes('?') ? '&' : '?'}error=${encodeURIComponent(message)}`) }

export async function applyToJob(formData: FormData) {
  const { supabase } = await requireRole(['teen'])
  const job_id = v(formData,'job_id')
  const note = v(formData,'note')
  if (!job_id) redirectTo('/app/teen/jobs', 'Missing job.')

  const { data, error } = await supabase.rpc('submit_job_application', {
    p_job_id: job_id,
    p_note: note || null,
    p_availability_confirmed: true,
    p_portfolio_ids: [],
  })
  if (error) redirectTo(`/app/teen/jobs/${job_id}`, error.message)
  if (!data?.ok) redirectTo(`/app/teen/jobs/${job_id}`, rpcText(data, 'Application was not submitted.'))
  revalidatePath('/app/teen/applications')
  redirectTo('/app/teen/applications', data?.message || 'Application submitted')
}

export async function saveJob(formData: FormData) {
  const { supabase } = await requireRole(['teen'])
  const job_id = v(formData,'job_id')
  if (!job_id) redirectTo('/app/teen/jobs', 'Missing job.')
  // Production model: saved_jobs is a simple (user_id, job_id) table and
  // saving goes through the guarded RPC (idempotent).
  const { data, error } = await supabase.rpc('save_my_job_v1', { p_job_id: job_id })
  if (error) redirectTo(`/app/teen/jobs/${job_id}`, error.message)
  if (data?.ok !== true) redirectTo(`/app/teen/jobs/${job_id}`, data?.message || data?.code || 'Could not save the job.')
  redirectTo(`/app/teen/jobs/${job_id}`, 'Saved job')
}

export async function safetyPing(formData: FormData) {
  const { supabase } = await requireRole(['teen'])
  const requestedStatus = v(formData,'status')
  const note = v(formData,'note')
  const clientRequestId = v(formData, 'client_request_id')
  if (!clientRequestId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientRequestId)) {
    redirectError('/app/safety', 'Refresh Safety Center and try again.')
  }
  if (requestedStatus === 'ok') {
    const checkinId = v(formData, 'checkin_id')
    if (!checkinId) redirectError('/app/safety', 'No scheduled check-in was selected.')
    const { data, error } = await supabase.rpc('complete_active_job_checkin', {
      p_checkin_id: checkinId,
      p_client_request_id: clientRequestId,
    })
    if (error) redirectError('/app/safety', `Safe check-in failed: ${error.message}`)
    if (data?.ok !== true) redirectError('/app/safety', data?.code || 'Safe check-in was not recorded.')
    revalidatePath('/app/safety')
    redirectTo('/app/safety', 'Safe check-in recorded')
  }
  if (requestedStatus !== 'needs_help') redirectError('/app/safety', 'Unsupported safety action.')
  const { data, error } = await supabase.rpc('create_safety_ping_v2', {
    p_status: 'needs_help',
    p_note: note || null,
    p_job_id: v(formData, 'job_id'),
    p_immediate_danger: ['true', 'on'].includes(v(formData, 'immediate_danger') || ''),
    p_client_request_id: clientRequestId,
  })
  if (error) redirectError('/app/safety', `Safety ping failed: ${error.message}`)
  if (data?.ok !== true) redirectError('/app/safety', data?.code || 'Safety ping was not recorded.')
  revalidatePath('/app/safety')
  redirectTo('/app/safety', 'Safety ping sent')
}

export async function recordProofUpload(formData: FormData): Promise<{ error?: string; ok?: boolean; message?: string }> {
  const { supabase } = await requireRole(['teen'])
  const application_id = v(formData,'application_id')
  const proof_id = v(formData,'proof_id')
  const storage_path = v(formData,'storage_path')
  const note = v(formData,'note')
  if (!application_id || !proof_id || !storage_path) return { error: 'Missing application, proof id, or file path.' }

  const { data, error } = await supabase.rpc('submit_application_proof', {
    p_proof_id: proof_id,
    p_application_id: application_id,
    p_storage_path: storage_path,
    p_note: note || null,
  })
  if (error) return { error: error.message }
  if (!data?.ok) return { error: rpcText(data, 'Proof could not be recorded.') }
  revalidatePath('/app/teen/active')
  return { ok: true, message: data?.message || 'Proof uploaded.' }
}
