'use server'
import { redirect } from 'next/navigation'
import { requireUser, requireRole } from '@/lib/auth'

export async function createSupportTicket(_formData: FormData): Promise<never> {
  await requireUser()
  redirect('/app/support?message=' + encodeURIComponent('Support tickets are not available because the production ticket workflow is not deployed. No ticket was created.'))
}

export async function replyToTicket(_formData: FormData): Promise<never> {
  await requireUser()
  redirect('/app/support?message=' + encodeURIComponent('Support-ticket replies are unavailable because the production ticket workflow is not deployed. No message was sent.'))
}

export async function updateSupportTicketStatus(_formData: FormData): Promise<never> {
  await requireRole(['admin'])
  redirect('/app/admin?message=' + encodeURIComponent('Support-ticket administration is unavailable because the production ticket workflow is not deployed. No status was changed.'))
}
