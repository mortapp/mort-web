import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, MessageThreadCard, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Messages({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase } = await requireRole(['teen', 'adult', 'guardian'])
  const { data: threadResult, error } = await supabase.rpc('list_my_message_threads_page', {
    p_query: '',
    p_cursor_updated_at: null,
    p_cursor_id: null,
    p_limit: 50,
  })
  const threads = Array.isArray(threadResult?.items) ? threadResult.items : []

  return (
    <>
      <PageHeaderWithActions
        title="Messages"
        eyebrow="Moderated, job-based chat"
        description="Conversations only open once there's a job application between you and the other person. Keep all job talk inside MORT."
      />
      <Toast message={sp?.message} />

      <div className="card info-card" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, margin: 0 }}>
          To start a new conversation, open an application from <Link href="/app/teen/applications" style={{ color: 'var(--baby-blue)' }}>My applications</Link> (teen) or <Link href="/app/adult/applications" style={{ color: 'var(--baby-blue)' }}>Applicants</Link> (adult) and tap <strong>Message</strong>. This keeps every thread tied to a real job — no random DMs.
        </p>
      </div>

      {error && <div className="error">Messages could not be loaded. Try again later.</div>}
      {!threads.length ? (
        <EmptyState icon="💬" title="No conversations yet" text="Threads open automatically once you're connected through a job application." />
      ) : (
        <div className="grid two">
          {threads.map((t: any) => {
            const flaggedRecently = false
            return (
              <MessageThreadCard
                key={t.id}
                href={`/app/messages/${t.id}`}
                title={t.job_title || 'MORT conversation'}
                preview={t.last_message_preview || 'No messages yet — say hello.'}
                scannerStatus={flaggedRecently ? 'flagged' : null}
                updatedAt={t.updated_at}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
