'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'
import { dollarsToCents } from '@/lib/money'

function v(fd: FormData,k:string){const x=fd.get(k); return x==null?null:String(x).trim()}
function requestId(){ return crypto.randomUUID() }
function rpcText(data: any, fallback = 'The backend rejected this request.') {
  return data?.message || data?.code || fallback
}
function getJobPayload(formData: FormData, profile: any) {
  const teenMinAge = Number(v(formData,'teen_min_age') || 13)
  const teenMaxAge = Number(v(formData,'teen_max_age') || 17)
  if (!Number.isInteger(teenMinAge) || !Number.isInteger(teenMaxAge) || teenMinAge < 13 || teenMaxAge > 17 || teenMinAge > teenMaxAge) {
    return { error: 'Choose a valid teen age range from 13 to 17.' }
  }
  const amount = dollarsToCents(formData.get('pay_amount'))
  return {
    payload: {
      title: v(formData,'title') || 'Local job',
      description: v(formData,'description') || 'No description provided',
      summary: v(formData,'description')?.slice(0, 180) || null,
      category: v(formData,'category') || 'general',
      location_text: v(formData,'location_text') || 'Approximate location shared after approval',
      city: v(formData,'city') || profile?.city || 'Indianapolis',
      state: v(formData,'state') || profile?.state || 'IN',
      adult_job_amount_cents: amount,
      pay_label: v(formData,'pay_label'),
      teen_min_age: teenMinAge,
      teen_max_age: teenMaxAge,
      requires_guardian_approval: formData.get('requires_guardian_approval') === 'on',
      estimated_duration_minutes: 60,
      workers_needed: 1,
      travel_radius_miles: 10,
      work_environment: 'unspecified',
      location_type: 'unspecified',
      physical_requirements: ['no physical requirement'],
      proof_expected: false,
      schedule_type: 'flexible',
      recurring: false,
      urgency: 'normal',
      payment_method: 'cash',
      payment_type: 'after_completion',
      payment_timing: 'after_completion',
      tip_allowed: true,
      applications_open: true,
      starts_at: v(formData,'starts_at') || null,
      acceptable_transportation_methods: ['walking','bicycle','car','public_transit','rideshare','other'],
    }
  }
}

export async function postJob(formData: FormData) {
  const { supabase, profile } = await requireRole(['adult','admin'])
  if (profile?.role !== 'admin' && profile?.verification_status !== 'approved') redirect('/app/verify?message=Adults must be approved before posting jobs.')
  const built = getJobPayload(formData, profile)
  if ('error' in built) redirect('/app/adult/post-job?message=' + encodeURIComponent(built.error!))

  const { data, error } = await supabase.rpc('save_job_draft_or_publish', {
    p_job_id: null,
    p_client_request_id: requestId(),
    p_payload: built.payload,
    p_publish: true,
  })
  if (error) redirect(`/app/adult/post-job?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/adult/post-job?message=${encodeURIComponent(rpcText(data, 'Job could not be published.'))}`)
  revalidatePath('/app/adult/jobs')
  redirect('/app/adult/jobs?message=Job posted')
}

function actionForApplicationStatus(status: string | null) {
  if (status === 'accepted') return 'accepted'
  if (status === 'rejected') return 'rejected'
  if (status === 'completed') return 'completed'
  if (status === 'in_progress') return 'in_progress'
  if (status === 'viewed') return 'viewed'
  return null
}

export async function setApplicationStatus(formData: FormData) {
  const { supabase } = await requireRole(['adult','admin'])
  const application_id = v(formData,'application_id')
  const action = actionForApplicationStatus(v(formData,'status'))
  if (!application_id) redirect('/app/adult/applications?message=' + encodeURIComponent('Missing application.'))
  if (!action) redirect('/app/adult/applications?message=' + encodeURIComponent('That application action is not allowed here.'))

  const { data, error } = await supabase.rpc('update_application_status_v3', {
    p_application_id: application_id,
    p_action: action,
    p_client_request_id: requestId(),
    p_expected_updated_at: null,
  })
  if (error) redirect(`/app/adult/applications?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/adult/applications?message=${encodeURIComponent(rpcText(data, 'Application was not updated.'))}`)
  revalidatePath('/app/adult/applications')
  revalidatePath('/app/adult/jobs')
  redirect('/app/adult/applications?message=Application updated')
}

function jobActionForStatus(status: string | null) {
  if (status === 'paused') return 'pause'
  if (status === 'open') return 'resume'
  if (status === 'closed') return 'close_applications'
  return null
}

export async function setJobStatus(formData: FormData) {
  const { supabase } = await requireRole(['adult','admin'])
  const job_id = v(formData,'job_id')
  const action = jobActionForStatus(v(formData,'status'))
  if (!job_id) redirect('/app/adult/jobs?message=' + encodeURIComponent('Missing job.'))
  if (!action) redirect('/app/adult/jobs?message=' + encodeURIComponent('That job action is not supported by the live backend.'))

  const { data, error } = await supabase.rpc('manage_job_v2', {
    p_job_id: job_id,
    p_action: action,
    p_reason: null,
    p_client_request_id: requestId(),
    p_expected_updated_at: null,
  })
  if (error) redirect(`/app/adult/jobs?message=${encodeURIComponent(error.message)}`)
  if (!data?.ok) redirect(`/app/adult/jobs?message=${encodeURIComponent(rpcText(data, 'Job was not updated.'))}`)
  revalidatePath('/app/adult/jobs')
  redirect('/app/adult/jobs?message=Job updated')
}
