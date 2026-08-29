import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, MessageThreadCard, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Messages({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireUser()
  const { data: threads } = await supabase
    .from('message_threads')
    .select('*, jobs(title), messages(body, created_at, scanner_status)')
    .or(`teen_id.eq.${user.id},adult_id.eq.${user.id},guardian_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })
    .limit(50)

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

      {!threads?.length ? (
        <EmptyState icon="💬" title="No conversations yet" text="Threads open automatically once you're connected through a job application." />
      ) : (
        <div className="grid two">
          {threads.map((t: any) => {
            const msgs = (t.messages || []).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            const last = msgs[msgs.length - 1]
            const flaggedRecently = msgs.some((m: any) => m.scanner_status === 'flagged')
            return (
              <MessageThreadCard
                key={t.id}
                href={`/app/messages/${t.id}`}
                title={t.jobs?.title || 'MORT conversation'}
                preview={last?.body || 'No messages yet — say hello.'}
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
