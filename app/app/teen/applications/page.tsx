import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, ApplicationCard, EmptyState, CategoryPill, StatusJourney } from '@/components/ui'
import { startThreadFromApplication } from '../../messages/actions'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

// Production model: job_applications (applicant_id) joined to jobs.
// Status vocabulary: submitted, withdrawn, shortlisted, accepted, rejected, cancelled.
export default async function Applications({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['teen'])
  const { data: apps } = await supabase
    .from('job_applications')
    .select('*, jobs(*), job_assignments(application_id, id)')
    .eq('applicant_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <PageHeaderWithActions title="My applications" eyebrow="Teen" description="Track where each application stands. Messaging opens once it's accepted." />
      <Toast message={sp?.message} />
      {!apps?.length ? (
        <EmptyState title="No applications" text="Apply to a job first." href="/app/teen/jobs" action="Find jobs" />
      ) : (
        <div className="grid two">
          {apps.map((a: any) => {
            const canMessage = a.status === 'accepted'
            const pay = a.jobs?.pay_label || (a.jobs?.pay_amount_cents ? centsToDollars(a.jobs.pay_amount_cents) : '')
            return (
              <ApplicationCard
                key={a.id}
                href={!canMessage ? `/app/teen/jobs/${a.job_id}` : undefined}
                title={a.jobs?.title || 'Job'}
                subtitle={[a.jobs?.city, a.jobs?.region, pay].filter(Boolean).join(' · ')}
                note={a.cover_note}
                status={a.status}
              >
                <div style={{ marginBottom: 12 }}><CategoryPill category={a.jobs?.category} /></div>
                <div style={{ marginBottom: 4 }}><StatusJourney status={a.status} /></div>
                {canMessage && (
                  <form action={startThreadFromApplication} className="row-actions" style={{ marginTop: 8 }}>
                    <input type="hidden" name="application_id" value={a.id} />
                    <button className="btn ghost sm">💬 Message</button>
                  </form>
                )}
              </ApplicationCard>
            )
          })}
        </div>
      )}
    </>
  )
}
