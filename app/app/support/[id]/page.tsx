import { redirect } from 'next/navigation'

export default async function TicketDetail() {
  redirect('/app/support?message=' + encodeURIComponent('Support tickets are not available in the current production backend.'))
}
