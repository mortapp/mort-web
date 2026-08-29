'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser, requireRole } from '@/lib/auth'

function v(fd: FormData, k: string) { const x = fd.get(k); return x == null ? null : String(x).trim() }
function rpcText(data: any, fallback = 'The backend rejected this request.') { return data?.message || data?.code || fallback }

export async function createSupportTicket(formData: FormData) {
  const { supabase } = await requireUser()
  const subject = v(formData, 'subject') || 'Support request'
  const message = v(formData, 'message') || ''
  const { data, error } = await supabase.rpc('create_support_ticket', { p_subject: subject, p_message: message })
  if (error) redirect(`/app/support?message=${encodeURIComponent('Could not create ticket: ' + error.message)}`)
  if (!data?.ok) redirect(`/app/support?message=${encodeURIComponent(rpcText(data, 'Could not create ticket.'))}`)
  const id = data?.ticket?.id
  revalidatePath('/app/support')
  redirect(id ? `/app/support/${id}?message=${encodeURIComponent('Ticket submitted')}` : `/app/support?message=${encodeURIComponent('Ticket submitted')}`)
}

export async function replyToTicket(formData: FormData) {
  const { supabase } = await requireUser()
  const ticket_id = v(formData, 'ticket_id')
  const body = v(formData, 'body')
  if (!ticket_id || !body) redirect(`/app/support/${ticket_id}?message=${encodeURIComponent('Message cannot be empty.')}`)
  const { data, error } = await supabase.rpc('post_support_ticket_message', {
    p_ticket_id: ticket_id,
    p_message: body,
    p_client_request_id: crypto.randomUUID(),
  })
  if (error) redirect(`/app/support/${ticket_id}?message=${encodeURIComponent('Reply failed: ' + error.message)}`)
  if (!data?.ok) redirect(`/app/support/${ticket_id}?message=${encodeURIComponent(rpcText(data, 'Reply failed.'))}`)
  revalidatePath(`/app/support/${ticket_id}`)
  redirect(`/app/support/${ticket_id}`)
}

export async function updateSupportTicketStatus(formData: FormData) {
  const { supabase } = await requireRole(['admin'])
  const ticket_id = v(formData, 'ticket_id')
  const status = v(formData, 'status') || 'in_progress'
  const allowed = new Set(['open', 'in_progress', 'resolved', 'closed'])
  if (!ticket_id) redirect(`/app/admin?message=${encodeURIComponent('Missing support ticket id.')}`)
  if (!allowed.has(status)) redirect(`/app/admin?message=${encodeURIComponent('Invalid support ticket status.')}`)

  const { data, error } = await supabase.rpc('support_staff_change_status', {
    p_ticket_id: ticket_id,
    p_status: status,
    p_resolution_code: status === 'resolved' || status === 'closed' ? 'web_admin_update' : null,
    p_reason: 'MORT web admin support update',
  })

  if (error) redirect(`/app/admin?message=${encodeURIComponent('Support status update failed: ' + error.message)}`)
  if (data && data.ok === false) redirect(`/app/admin?message=${encodeURIComponent(rpcText(data, 'Support status update rejected by backend.'))}`)
  revalidatePath('/app/admin')
  redirect('/app/admin?message=Support ticket updated')
}
