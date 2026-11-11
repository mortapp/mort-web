'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'

function v(fd: FormData, k: string) { const x = fd.get(k); return x == null ? null : String(x).trim() }

// Production conversation model:
// - conversations (job_id, assignment_id, conversation_type, status)
// - conversation_members (conversation_id, user_id)
// - messages (conversation_id, sender_id, body, moderation_status)
// Job conversations are created by mort_accept_job_application when an
// application is accepted; this action finds the right existing conversation.
export async function startThreadFromApplication(formData: FormData) {
  const { supabase, user } = await requireUser()
  const application_id = v(formData, 'application_id')
  if (!application_id) redirect('/app/messages?message=' + encodeURIComponent('Missing application.'))

  // Only participants of the application's assignment (or staff) may open the thread.
  const { data: assignment } = await supabase
    .from('job_assignments')
    .select('id, teen_user_id, adult_user_id')
    .eq('application_id', application_id)
    .maybeSingle()

  const { data: application } = await supabase
    .from('job_applications')
    .select('id, applicant_id, job_id, status, jobs!inner(poster_id, title)')
    .eq('id', application_id)
    .maybeSingle()

  if (!application) redirect('/app/messages?message=' + encodeURIComponent('Application not found.'))
  const adultId = (application as any).jobs?.poster_id
  const teenId = application.applicant_id
  const isParticipant =
    user.id === teenId || user.id === adultId || (assignment && [assignment.teen_user_id, assignment.adult_user_id].includes(user.id))
  if (!isParticipant) redirect('/app/messages?message=' + encodeURIComponent('You are not part of this application.'))

  // Only accepted applications have open conversations.
  if (application.status !== 'accepted') {
    redirect('/app/messages?message=' + encodeURIComponent('Messaging opens once the application is accepted.'))
  }

  if (user.id === teenId) {
    const { data: teenProfile } = await supabase.from('profiles').select('guardian_paused').eq('id', user.id).maybeSingle()
    if (teenProfile?.guardian_paused) redirect('/app/messages?message=' + encodeURIComponent('Your guardian has paused your account. Ask them to resume it before messaging.'))
  }

  // Find the conversation for this application's assignment (job conversations
  // are created on acceptance). Fall back to any active job conversation on
  // the job where the user is a member.
  let conversationId: string | null = null
  if (assignment) {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('assignment_id', assignment.id)
      .maybeSingle()
    conversationId = conv?.id ?? null
  }
  if (!conversationId) {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id, conversation_members!inner(user_id)')
      .eq('job_id', application.job_id)
      .eq('conversation_members.user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    conversationId = conv?.id ?? null
  }
  if (!conversationId) {
    redirect('/app/messages?message=' + encodeURIComponent('The conversation for this job is not open yet.'))
  }

  revalidatePath('/app/messages')
  redirect(`/app/messages/${conversationId}`)
}

export async function sendMessage(formData: FormData) {
  const { supabase, user, profile } = await requireUser()
  const conversation_id = v(formData, 'conversation_id')
  const body = v(formData, 'body')
  if (!conversation_id || !body) redirect(`/app/messages/${conversation_id}?message=${encodeURIComponent('Message cannot be empty.')}`)

  const { data: membership } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('conversation_id', conversation_id)
    .eq('user_id', user.id)
    .maybeSingle()
  const isParticipant = !!membership || profile?.role === 'admin'
  if (!isParticipant) redirect(`/app/messages?message=${encodeURIComponent('You are not part of this conversation.')}`)

  if (profile?.role === 'teen' || !profile?.role) {
    const { data: teenProfile } = await supabase.from('profiles').select('guardian_paused').eq('id', user.id).maybeSingle()
    if (teenProfile?.guardian_paused) redirect(`/app/messages?message=${encodeURIComponent('Your guardian has paused your account. Ask them to resume it before messaging.')}`)
  }

  const { data, error } = await supabase.rpc('mort_send_message', {
    p_conversation_id: conversation_id,
    p_body: body,
  })
  if (error) redirect(`/app/messages/${conversation_id}?message=${encodeURIComponent(error.message)}`)
  if (data && data.ok === false) redirect(`/app/messages/${conversation_id}?message=${encodeURIComponent(data.message || data.code || 'Message was not sent.')}`)

  revalidatePath(`/app/messages/${conversation_id}`)
  redirect(`/app/messages/${conversation_id}`)
}
