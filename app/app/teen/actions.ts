'use server'
import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'

function v(fd: FormData, k: string){ const x=fd.get(k); return x==null?null:String(x).trim() }
function rpcText(data: any, fallback = 'The backend rejected this request.') { return data?.message || data?.code || fallback }
function redirectTo(path: string, message: string): never { redirect(`${path}${path.includes('?') ? '&' : '?'}message=${encodeURIComponent(message)}`) }

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
  const { supabase, user } = await requireRole(['teen'])
  const job_id = v(formData,'job_id')
  if (!job_id) redirectTo('/app/teen/jobs', 'Missing job.')
  const { error } = await supabase.from('saved_jobs').upsert(
    { user_id: user.id, job_id },
    { onConflict: 'user_id,job_id', ignoreDuplicates: true }
  )
  if (error) redirectTo(`/app/teen/jobs/${job_id}`, 'Could not save this job.')
  revalidatePath('/app/teen/saved')
  redirectTo(`/app/teen/jobs/${job_id}`, 'Saved job')
}

export async function safetyPing(formData: FormData) {
  const { supabase } = await requireRole(['teen'])
  const requestedStatus = v(formData,'status')
  if (requestedStatus !== 'needs_help') {
    redirectTo('/app/safety', 'Routine check-ins are not available here. Use the help request only when you need assistance.')
  }
  const note = v(formData,'note')
  const { data, error } = await supabase.rpc('create_safety_ping_v2', {
    p_status: 'needs_help',
    p_note: note || null,
    p_job_id: v(formData,'job_id'),
    p_immediate_danger: v(formData,'immediate_danger') === 'true',
    p_client_request_id: randomUUID(),
  })
  if (error || data?.ok !== true) redirectTo('/app/safety', rpcText(data, error?.message || 'Help request could not be sent.'))
  redirectTo('/app/safety', 'Help request submitted. If you are in immediate danger, call emergency services.')
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
