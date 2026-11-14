import { randomUUID } from 'node:crypto'
import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { sendMessage } from '../actions'
import { SubmitButton } from '@/components/submit-button'
import { Toast } from '@/components/toast'

export const dynamic = 'force-dynamic'

export default async function ThreadDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string,string>> }) {
  const { id } = await params
  const sp = await searchParams
  const { supabase, user, profile } = await requireUser()

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*, jobs(title, poster_id), conversation_members(user_id)')
    .eq('id', id)
    .maybeSingle()

  if (!conversation) {
    return <div className="error">Conversation not found.</div>
  }

  const isParticipant = (conversation.conversation_members || []).some((m: any) => m.user_id === user.id) || profile?.role === 'admin'
  if (!isParticipant) {
    return <div className="error">You don&rsquo;t have access to this conversation.</div>
  }

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  return (
    <>
      <PageHeaderWithActions title={conversation.jobs?.title || 'Conversation'} eyebrow="Messages">
        <Link href="/app/messages" className="btn ghost sm">← All threads</Link>
      </PageHeaderWithActions>

      <Toast message={sp?.message} />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="message-list">
          {!messages?.length && <p style={{ fontSize: 13 }}>No messages yet — say hello and keep it about the job.</p>}
          {(messages || []).map((m: any) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
              <div className={`message-bubble ${m.sender_id === user.id ? 'mine' : 'theirs'}`}>
                {m.body}
              </div>
              <div className="message-meta" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {new Date(m.created_at).toLocaleString()}
                {m.moderation_status && m.moderation_status !== 'approved' && <Status value={m.moderation_status} />}
                {m.sender_id !== user.id && (
                  <Link
                    href={'/app/reports/new?target_message_id=' + encodeURIComponent(m.id) + '&target_user_id=' + encodeURIComponent(m.sender_id) + '&reason=' + encodeURIComponent('Harassment or bullying') + '&details=' + encodeURIComponent('Reporting a message in conversation ' + id)}
                    className="btn danger sm"
                  >
                    Report message
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form action={sendMessage} className="card form">
        <input type="hidden" name="conversation_id" value={id} />
        <input type="hidden" name="client_request_id" value={randomUUID()} />
        <label>
          Reply
          <textarea name="body" required placeholder="Keep it about the job. Never share passwords, home address, or ask to move off MORT." />
        </label>
        <SubmitButton pendingLabel="Sending…">Send</SubmitButton>
      </form>
    </>
  )
}
