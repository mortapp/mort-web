'use server'
import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/auth'

function v(fd: FormData, k: string) { const x = fd.get(k); return x == null ? null : String(x).trim() }

export async function sendMessage(formData: FormData) {
  const { supabase } = await requireRole(['teen', 'adult', 'guardian'])
  const thread_id = v(formData, 'thread_id')
  const body = v(formData, 'body')
  if (!thread_id || !body) redirect(`/app/messages/${thread_id || ''}?message=${encodeURIComponent('Message cannot be empty.')}`)
  if (body.length > 2000) redirect(`/app/messages/${thread_id}?message=${encodeURIComponent('Message is too long.')}`)
  const { data, error } = await supabase.rpc('send_safe_message_v2', {
    p_thread_id: thread_id,
    p_body: body,
    p_client_request_id: randomUUID(),
  })
  if (error || data?.ok === false) redirect(`/app/messages/${thread_id}?message=${encodeURIComponent(data?.code || error?.message || 'Message could not be sent.')}`)
  revalidatePath(`/app/messages/${thread_id}`)
  revalidatePath('/app/messages')
  redirect(`/app/messages/${thread_id}`)
}