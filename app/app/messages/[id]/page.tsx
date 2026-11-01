import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status } from '@/components/ui'
import { sendMessage } from '../actions'
import { SubmitButton } from '@/components/submit-button'
import { Toast } from '@/components/toast'

export const dynamic = 'force-dynamic'

export default async function ThreadDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string>> }) {
  const { id } = await params
  const sp = await searchParams
  const { supabase, user } = await requireRole(['teen', 'adult', 'guardian'])

  const { data: result, error } = await supabase.rpc('list_thread_messages_page', {
    p_thread_id: id,
    p_cursor_created_at: null,
    p_cursor_id: null,
    p_limit: 100,
  })
  const thread = result?.thread || null
  const messages = Array.isArray(result?.items) ? [...result.items].reverse() : []
  if (!thread || error || result?.ok === false) {
    return <div className="error">Conversation not found or unavailable.</div>
  }
  await supabase.rpc('mark_message_thread_read', { p_thread_id: id })

  return (
    <>
      <PageHeaderWithActions title={thread.job_title || 'Conversation'} eyebrow="Messages">
        <Link href="/app/messages" className="btn ghost sm">← All threads</Link>
        <Link href={`/app/reports/new?target_message_id=${messages[messages.length - 1]?.id || ''}&reason=privacy&details=${encodeURIComponent('Reporting a concern from this conversation.')}`} className="btn danger sm">🚩 Report</Link>
      </PageHeaderWithActions>

      <Toast message={sp?.message} />
      <div className="notice" style={{ marginBottom: 16 }}>
        <strong>Blocking is not available in the current production backend.</strong>
        <p>If a conversation becomes unsafe, stop replying and use Report to submit the message for review. If there is immediate danger, contact emergency services or a trusted adult; do not wait for MORT.</p>
      </div>

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
                {m.scanner_status && m.scanner_status !== 'clean' && <Status value={m.scanner_status} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form action={sendMessage} className="card form">
        <input type="hidden" name="thread_id" value={id} />
        <label>
          Reply
          <textarea name="body" required placeholder="Keep it about the job. Never share passwords, home address, or ask to move off MORT." />
        </label>
        <SubmitButton pendingLabel="Sending…">Send</SubmitButton>
      </form>
    </>
  )
}
