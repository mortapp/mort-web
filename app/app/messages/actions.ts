'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'

function v(fd: FormData, k: string) { const x = fd.get(k); return x == null ? null : String(x).trim() }
function redirectError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

// A job conversation is created by mort_accept_job_application when an
// application is accepted. This action only locates that existing thread.
export async function startThreadFromApplication(formData: FormData) {
  const { supabase, user } = await requireUser()
  const application_id = v(formData, 'application_id')
  if (!application_id) redirectError('/app/messages', 'Missing application.')

  const { data: assignment, error: assignmentError } = await supabase
    .from('job_assignments')
    .select('id, teen_user_id, adult_user_id')
    .eq('application_id', application_id)
    .maybeSingle()
  if (assignmentError) redirectError('/app/messages', 'Could not load the accepted job assignment.')

  const { data: application, error: applicationError } = await supabase
    .from('job_applications')
    .select('id, applicant_id, job_id, status, jobs!inner(poster_id, title)')
    .eq('id', application_id)
    .maybeSingle()
  if (applicationError) redirectError('/app/messages', 'Could not load the application. Refresh and try again.')
  if (!application) redirectError('/app/messages', 'Application not found.')

  const adultId = (application as any).jobs?.poster_id
  const teenId = application.applicant_id
  const isParticipant = user.id === teenId || user.id === adultId ||
    (assignment && [assignment.teen_user_id, assignment.adult_user_id].includes(user.id))
  if (!isParticipant) redirectError('/app/messages', 'You are not part of this application.')
  if (application.status !== 'accepted') {
    redirectError('/app/messages', 'Messaging opens once the application is accepted.')
  }

  if (user.id === teenId) {
    const { data: teenProfile, error: profileError } = await supabase
      .from('profiles').select('guardian_paused').eq('id', user.id).maybeSingle()
    if (profileError || !teenProfile) redirectError('/app/messages', 'Could not confirm account messaging access. Refresh and try again.')
    if (teenProfile.guardian_paused) redirectError('/app/messages', 'Your guardian has paused your account. Ask them to resume it before messaging.')
  }

  let conversationId: string | null = null
  if (assignment) {
    const { data: conv, error: conversationError } = await supabase
      .from('conversations').select('id').eq('assignment_id', assignment.id).maybeSingle()
    if (conversationError) redirectError('/app/messages', 'The job conversation could not be loaded.')
    conversationId = conv?.id ?? null
  }
  if (!conversationId) {
    const { data: conv, error: conversationError } = await supabase
      .from('conversations')
      .select('id, conversation_members!inner(user_id)')
      .eq('job_id', application.job_id)
      .eq('conversation_members.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (conversationError) redirectError('/app/messages', 'The job conversation could not be loaded.')
    conversationId = conv?.id ?? null
  }
  if (!conversationId) redirectError('/app/messages', 'The conversation for this job is not open yet.')

  revalidatePath('/app/messages')
  redirect(`/app/messages/${conversationId}`)
}

export async function sendMessage(formData: FormData) {
  const { supabase, user } = await requireUser()
  const conversation_id = v(formData, 'conversation_id')
  const body = v(formData, 'body')
  const client_request_id = v(formData, 'client_request_id')
  if (!conversation_id || !body) redirectError(`/app/messages/${conversation_id || ''}`, 'Message cannot be empty.')
  if (!client_request_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(client_request_id)) {
    redirectError(`/app/messages/${conversation_id}`, 'Refresh the conversation and try again.')
  }

  const { data: membership, error: membershipError } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('conversation_id', conversation_id)
    .eq('user_id', user.id)
    .maybeSingle()
  if (membershipError) redirectError('/app/messages', 'Could not verify conversation access.')
  if (!membership) redirectError('/app/messages', 'You are not part of this conversation.')

  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('role, guardian_paused').eq('id', user.id).maybeSingle()
  if (profileError || !profile) redirectError('/app/messages', 'Could not verify account messaging access.')
  if (profile.role === 'teen' && profile.guardian_paused) {
    redirectError('/app/messages', 'Your guardian has paused your account. Ask them to resume it before messaging.')
  }

  const { data, error } = await supabase.rpc('send_safe_message_v2', {
    p_thread_id: conversation_id,
    p_body: body,
    p_client_request_id: client_request_id,
  })
  if (error) redirectError(`/app/messages/${conversation_id}`, error.message)
  if (data?.ok === false) redirectError(`/app/messages/${conversation_id}`, data?.message || data?.code || 'Message was not sent.')
  if (!data || typeof data.id !== 'string' || typeof data.thread_id !== 'string' || typeof data.sender_id !== 'string' || typeof data.body !== 'string') {
    redirectError(`/app/messages/${conversation_id}`, 'The message server returned an incomplete response. Refresh and try again.')
  }

  revalidatePath(`/app/messages/${conversation_id}`)
  redirect(`/app/messages/${conversation_id}`)
}
