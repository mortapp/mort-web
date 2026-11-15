'use server'
import { redirect } from 'next/navigation'
import { requireUser, requireRole } from '@/lib/auth'

function v(fd: FormData, k: string) { const x = fd.get(k); return x == null ? null : String(x).trim() }
export async function createSupportTicket(formData: FormData) {
  await requireUser()
  redirect(`/app/support?error=${encodeURIComponent('Ticket submission is unavailable because the production backend does not expose a support-ticket creation RPC yet.')}`)
}

export async function replyToTicket(formData: FormData) {
  await requireUser()
  const ticket_id = v(formData, 'ticket_id')
  redirect(`/app/support/${ticket_id || ''}?error=${encodeURIComponent('Replies are unavailable because the production backend does not expose a support-ticket reply RPC yet.')}`)
}

export async function updateSupportTicketStatus(formData: FormData) {
  await requireRole(['admin'])
  redirect(`/app/admin?error=${encodeURIComponent('Support status changes are unavailable because the production backend does not expose a staff support-review RPC yet.')}`)
}
