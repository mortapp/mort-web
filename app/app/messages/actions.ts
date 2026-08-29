'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { scanMessage } from '@/lib/mort'

function v(fd: FormData, k: string) { const x = fd.get(k); return x == null ? null : String(x).trim() }

export async function startThreadFromApplication(formData: FormData) {
  const { supabase, user, profile } = await requireUser()
  const application_id = v(formData, 'application_id')
  if (!application_id) redirect('/app/messages?message=' + encodeURIComponent('Missing application.'))

  const { data: application } = await supabase
    .from('applications')
    .select('id, teen_id, job_id, status, jobs(poster_id, title)')
    .eq('id', application_id)
    .maybeSingle()
  if (!application) redirect('/app/messages?message=' + encodeURIComponent('Application not found.'))
  const adultId = (application as any).jobs?.poster_id
  const teenId = application.teen_id
  const isParticipant = user.id === teenId || user.id === adultId || profile?.role === 'admin'
  if (!isParticipant) redirect('/app/messages?message=' + encodeURIComponent('You are not part of this application.'))
  if (profile?.role !== 'admin' && (application.status === 'guardian_pending' || application.status === 'guardian_rejected')) {
    redirect('/app/messages?message=' + encodeURIComponent('This application is waiting on guardian review — messaging opens once that clears.'))
  }

  if (user.id === teenId) {
    const { data: teenProfile } = await supabase.from('teen_profiles').select('paused_by_guardian').eq('user_id', user.id).maybeSingle()
    if (teenProfile?.paused_by_guardian) redirect('/app/messages?message=' + encodeURIComponent('Your guardian has paused your account. Ask them to resume it before messaging.'))
  }
  const { data: existing } = await supabase.from('message_threads').select('id').eq('application_id', application_id).maybeSingle()
  if (existing) redirect(`/app/messages/${existing.id}`)

  const { data: thread, error } = await supabase
    .from('message_threads')
    .insert({ job_id: application.job_id, application_id, teen_id: teenId, adult_id: adultId || null })
    .select('id')
    .single()
  if (error) redirect('/app/messages?message=' + encodeURIComponent(error.message))
  revalidatePath('/app/messages')
  redirect(`/app/messages/${thread!.id}`)
}

export async function sendMessage(formData: FormData) {
  const { supabase, user, profile } = await requireUser()
  const thread_id = v(formData, 'thread_id')
  const body = v(formData, 'body')
  if (!thread_id || !body) redirect(`/app/messages/${thread_id}?message=${encodeURIComponent('Message cannot be empty.')}`)

  const { data: thread } = await supabase.from('message_threads').select('id, teen_id, adult_id, guardian_id').eq('id', thread_id).maybeSingle()
  if (!thread) redirect('/app/messages?message=' + encodeURIComponent('Thread not found.'))
  const isParticipant = [thread.teen_id, thread.adult_id, thread.guardian_id].includes(user.id) || profile?.role === 'admin'
  if (!isParticipant) redirect('/app/messages?message=' + encodeURIComponent('You are not part of this conversation.'))

  const scanner_status = scanMessage(body!)
  const { error } = await supabase.rpc('send_safe_message_v2', {
    p_thread_id: thread_id,
    p_body: body,
    p_client_request_id: crypto.randomUUID(),
  })
  if (error) redirect(`/app/messages/${thread_id}?message=${encodeURIComponent(error.message)}`)
  revalidatePath(`/app/messages/${thread_id}`)
  revalidatePath('/app/messages')
  redirect(`/app/messages/${thread_id}${scanner_status === 'flagged' ? '?message=' + encodeURIComponent('Message sent — it was flagged for review because it looked like it might share contact info or push activity off MORT.') : ''}`)
}
