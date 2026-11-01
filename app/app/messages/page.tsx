import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, MessageThreadCard, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Messages({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, profile } = await requireRole(['teen', 'adult', 'guardian'])
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
          {profile?.role === 'teen' ? <>Open one of your applications and use the supported job conversation when an assignment is accepted. This keeps every thread tied to a real job — no random DMs. <Link href="/app/teen/applications" className="text-link">My applications</Link></> : profile?.role === 'adult' ? <>Review applications on your own jobs and use the supported job conversation after an assignment is accepted. <Link href="/app/adult/applications" className="text-link">Applicants</Link></> : <>Guardian inbox access is limited to conversations shared through your active consent-based connections. Guardians cannot initiate teen/adult job conversations.</>}
        </p>
      </div>

      {error && <div className="error">Messages could not be loaded. Try again later.</div>}
      {!threads.length ? (
        <EmptyState icon="💬" title="No conversations yet" text="Threads open automatically once you're connected through a job application." />
      ) : (
        <div className="grid two">
          {threads.map((t: any) => {
            return (
              <MessageThreadCard
                key={t.id}
                href={`/app/messages/${t.id}`}
                title={t.job_title || 'MORT conversation'}
                preview={t.last_message_preview || 'No messages yet — say hello.'}
                scannerStatus={null}
                updatedAt={t.updated_at}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
