import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, ApplicationCard, EmptyState, CategoryPill, StatusJourney } from '@/components/ui'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Applications({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['teen'])
  const { data: applicationResult, error } = await supabase.rpc('get_my_job_applications', { p_application_id: null })
  const apps = applicationResult?.ok === true && Array.isArray(applicationResult.items) ? applicationResult.items : []

  return (
    <>
      <PageHeaderWithActions title="My applications" eyebrow="Teen" description="Track applications using MORT's current job-application workflow. Messaging opens after an assignment is accepted." />
      <Toast message={sp?.message} />
      {error && <div className="error">Applications could not be loaded. Try again later.</div>}
      {!apps.length ? (
        <EmptyState title="No applications" text="Apply to a job first." href="/app/teen/jobs" action="Find jobs" />
      ) : (
        <div className="grid two">
          {apps.map((a: any) => {
            const pay = a.jobs?.pay_label || (a.jobs?.pay_amount_cents ? centsToDollars(a.jobs.pay_amount_cents) : '')
            return (
              <ApplicationCard
                key={a.id}
                href={!canMessage ? `/app/teen/jobs/${a.job_id}` : undefined}
                title={a.jobs?.title || 'Job'}
                subtitle={[a.jobs?.city, a.jobs?.state, pay].filter(Boolean).join(' · ')}
                note={a.note}
                status={a.status}
              >
                <div style={{ marginBottom: 12 }}><CategoryPill category={a.jobs?.category} /></div>
                <div style={{ marginBottom: 4 }}><StatusJourney status={a.status} /></div>
                <p style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 8 }}>Messaging becomes available after an accepted assignment creates a conversation.</p>
              </ApplicationCard>
            )
          })}
        </div>
      )}
    </>
  )
}
