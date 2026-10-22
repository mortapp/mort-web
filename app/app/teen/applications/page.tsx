import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, ApplicationCard, EmptyState, CategoryPill, StatusJourney, MetricCard } from '@/components/ui'
import { startThreadFromApplication } from '../../messages/actions'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'review', label: 'In review' },
  { key: 'accepted', label: 'Accepted / active' },
  { key: 'completed', label: 'Completed' },
  { key: 'declined', label: 'Not selected' },
] as const
type ApplicationFilter = typeof FILTERS[number]['key']

const FILTER_STATUSES: Record<Exclude<ApplicationFilter, 'all'>, string[]> = {
  review: ['submitted', 'adult_review', 'guardian_pending'],
  accepted: ['accepted', 'in_progress', 'proof_submitted', 'completion_pending_release'],
  completed: ['completed'],
  declined: ['rejected', 'guardian_rejected'],
}

export default async function Applications({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const selectedFilter: ApplicationFilter = FILTERS.find((item) => item.key === sp?.filter)?.key || 'all'
  const { supabase, user } = await requireRole(['teen'])

  const { data: allApps } = await supabase.from('applications').select('status').eq('teen_id', user.id)
  const statuses = (allApps || []).map((app: any) => app.status as string)
  const countFor = (filter: ApplicationFilter) => filter === 'all'
    ? statuses.length
    : statuses.filter((status) => FILTER_STATUSES[filter].includes(status)).length

  let appsQuery = supabase
    .from('applications')
    .select('*, jobs(*)')
    .eq('teen_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)
  if (selectedFilter !== 'all') appsQuery = appsQuery.in('status', FILTER_STATUSES[selectedFilter])
  const { data: apps } = await appsQuery

  return (
    <>
      <PageHeaderWithActions
        title="My applications"
        eyebrow="Teen workspace"
        description="Track every application from first review through the work itself. Guardian approval may be required before next steps unlock."
      >
        <Link href="/app/marketplace" className="btn primary">Explore jobs</Link>
        <Link href="/app/teen/active" className="btn ghost">Active jobs</Link>
      </PageHeaderWithActions>

      <Toast message={sp?.message} />

      <div className="application-summary-grid">
        <MetricCard icon="↗" label="Applications" value={countFor('all')} />
        <MetricCard icon="◷" label="In review" value={countFor('review')} />
        <MetricCard icon="✓" label="Accepted / active" value={countFor('accepted')} />
        <MetricCard icon="▣" label="Completed" value={countFor('completed')} />
      </div>

      <nav className="application-status-filters" aria-label="Filter applications">
        {FILTERS.map((item) => (
          <Link
            key={item.key}
            href={item.key === 'all' ? '/app/teen/applications' : `/app/teen/applications?filter=${item.key}`}
            className={`application-filter-chip ${selectedFilter === item.key ? 'active' : ''}`}
            aria-current={selectedFilter === item.key ? 'page' : undefined}
          >
            <span>{item.label}</span><span className="application-filter-count">{countFor(item.key)}</span>
          </Link>
        ))}
      </nav>

      {!apps?.length ? (
        <EmptyState
          icon="▤"
          title={selectedFilter === 'all' ? 'No applications yet' : 'Nothing in this view'}
          text={selectedFilter === 'all' ? 'Apply to a job when you find a good fit. Your application status will appear here.' : 'Try another status filter or explore more local jobs.'}
          href="/app/marketplace"
          action="Find local jobs"
        />
      ) : (
        <div className="grid two application-dashboard-grid">
          {apps.map((a: any) => {
            const canMessage = a.status !== 'guardian_pending' && a.status !== 'guardian_rejected'
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
                <div className="application-card-detail"><CategoryPill category={a.jobs?.category} /></div>
                <div className="application-card-journey"><StatusJourney status={a.status} /></div>
                {a.status === 'guardian_pending' && (
                  <div className="application-guardian-note">Waiting for guardian approval. Messaging stays locked until the required approval is complete.</div>
                )}
                {canMessage && (
                  <form action={startThreadFromApplication} className="row-actions application-card-actions">
                    <input type="hidden" name="application_id" value={a.id} />
                    <button className="btn ghost sm">Open conversation</button>
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
