import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { replyToTicket } from '../actions'
import { Toast } from '@/components/toast'
import { SubmitButton } from '@/components/submit-button'
export const dynamic = 'force-dynamic'

export default async function TicketDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string>> }) {
  const { id } = await params
  const sp = await searchParams
  const { supabase, user, profile } = await requireUser()

  const { data: ticket, error: ticketError } = await supabase.from('support_tickets').select('*').eq('id', id).maybeSingle()
  if (ticketError || !ticket) {
    return (<><PageHeaderWithActions title="Ticket" eyebrow="Support" /><div className="error">{ticketError?.message || 'Ticket not found.'}</div></>)
  }
  const isOwnerOrAdmin = ticket.requester_id === user.id || profile?.role === 'admin'
  if (!isOwnerOrAdmin) return <div className="error">You don&apos;t have access to this ticket.</div>

  const { data: msgs } = await supabase.from('support_ticket_messages').select('*').eq('ticket_id', id).order('created_at', { ascending: true })

  return (
    <>
      <PageHeaderWithActions title={ticket.subject} eyebrow={`Support · ${ticket.category}`}>
        <Link href="/app/support" className="btn ghost sm">← My tickets</Link>
        <Status value={ticket.status} />
      </PageHeaderWithActions>
      <Toast message={sp?.message} />

      <div className="card" style={{ marginBottom: 16 }}>
        <p>{ticket.description || 'Support conversation'}</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="message-list">
          {!msgs?.length && <p style={{ fontSize: 13 }}>No replies yet.</p>}
          {(msgs || []).map((m: any) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
              <div className={`message-bubble ${m.sender_id === user.id ? 'mine' : 'theirs'}`}>{m.body}</div>
              <div className="message-meta">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <form action={replyToTicket} className="card form">
        <input type="hidden" name="ticket_id" value={id} />
        <label>Reply<textarea name="body" required /></label>
        <SubmitButton pendingLabel="Sending…">Send reply</SubmitButton>
      </form>
    </>
  )
}
