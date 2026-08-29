'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireRole, requireUser } from '@/lib/auth'

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
  const { supabase, user } = await requireUser()
  const job_id = v(formData,'job_id')
  let { data: folder } = await supabase.from('user_saved_job_folders').select('*').eq('user_id', user.id).eq('name','Saved').maybeSingle()
  if (!folder) { const res = await supabase.from('user_saved_job_folders').insert({ user_id: user.id, name: 'Saved' }).select('*').single(); folder = res.data }
  if (folder) await supabase.from('saved_job_folder_items').insert({ folder_id: folder.id, job_id })
  redirectTo(`/app/teen/jobs/${job_id}`, 'Saved job')
}

export async function safetyPing(formData: FormData) {
  const { supabase, user } = await requireRole(['teen'])
  const requestedStatus = v(formData,'status')
  const status = (requestedStatus === 'ok' || requestedStatus === 'needs_help') ? requestedStatus : 'ok'
  const note = v(formData,'note')
  const { error } = await supabase.from('safety_pings').insert({ teen_id: user.id, status, note })
  if (error) redirectTo('/app/safety', error.message)
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
