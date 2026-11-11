import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, MessageThreadCard, EmptyState } from '@/components/ui'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Messages({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireUser()
  // Production conversation model: conversations + conversation_members.
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, jobs(title), conversation_members(user_id), messages(conversation_id, body, created_at, moderation_status)')
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(50)

  // Keep only conversations this user is a member of.
  const mine = (conversations || []).filter((c: any) =>
    (c.conversation_members || []).some((m: any) => m.user_id === user.id)
  )

  return (
    <>
      <PageHeaderWithActions
        title="Messages"
        eyebrow="Moderated, job-based chat"
        description="Conversations only open once there's an accepted job application between you and the other person. Keep all job talk inside MORT."
      />
      <Toast message={sp?.message} />

      <div className="card info-card" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 13, margin: 0 }}>
          To start a new conversation, open an application from <Link href="/app/teen/applications" style={{ color: 'var(--baby-blue)' }}>My applications</Link> (teen) or <Link href="/app/adult/applications" style={{ color: 'var(--baby-blue)' }}>Applicants</Link> (adult) and tap <strong>Message</strong>. This keeps every thread tied to a real job — no random DMs.
        </p>
      </div>

      {!mine.length ? (
        <EmptyState icon="💬" title="No conversations yet" text="Threads open automatically once an application is accepted." />
      ) : (
        <div className="grid two">
          {mine.map((t: any) => {
            const msgs = (t.messages || [])
              .filter((m: any) => !m.deleted_at)
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            const last = msgs[msgs.length - 1]
            const flaggedRecently = msgs.some((m: any) => m.moderation_status === 'flagged')
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
