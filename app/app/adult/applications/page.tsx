import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, ApplicationCard, EmptyState, CategoryPill, MetricCard } from '@/components/ui'
import { setApplicationStatus } from '../actions'
import { startThreadFromApplication } from '../../messages/actions'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

const FILTERS = [
  { key: 'all', label: 'All applicants' },
  { key: 'review', label: 'Review queue' },
  { key: 'active', label: 'Accepted / active' },
  { key: 'completed', label: 'Completed' },
  { key: 'declined', label: 'Not selected' },
] as const
type ApplicantFilter = typeof FILTERS[number]['key']

const FILTER_STATUSES: Record<Exclude<ApplicantFilter, 'all'>, string[]> = {
  review: ['submitted', 'adult_review', 'guardian_pending'],
  active: ['accepted', 'in_progress', 'proof_submitted', 'completion_pending_release'],
  completed: ['completed'],
  declined: ['rejected', 'guardian_rejected'],
}

export default async function AdultApplications({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const selectedFilter: ApplicantFilter = FILTERS.find((item) => item.key === sp?.filter)?.key || 'all'
  const { supabase, user, profile } = await requireRole(['adult','admin'])

  let query = supabase
    .from('applications')
    .select('*, jobs!inner(*), profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(100)
  if (profile?.role !== 'admin') query = query.eq('jobs.poster_id', user.id)
  const { data: allApps } = await query

  const applications = allApps || []
  const statuses = applications.map((app: any) => app.status as string)
  const countFor = (filter: ApplicantFilter) => filter === 'all'
    ? statuses.length
    : statuses.filter((status) => FILTER_STATUSES[filter].includes(status)).length
  const apps = selectedFilter === 'all'
    ? applications
    : applications.filter((app: any) => FILTER_STATUSES[selectedFilter].includes(app.status))

  return (
    <>
      <PageHeaderWithActions
        title="Applicant review"
        eyebrow="Adult workspace"
        description="Review applications for jobs you manage. Applicant details stay scoped to your own listings."
      >
        <Link href="/app/adult/jobs" className="btn ghost">My jobs</Link>
        <Link href="/app/adult/post-job" className="btn primary">Post a job</Link>
      </PageHeaderWithActions>

      <Toast message={sp?.message} />

      <div className="application-summary-grid">
        <MetricCard icon="◎" label="Applicants" value={countFor('all')} />
        <MetricCard icon="◷" label="Review queue" value={countFor('review')} />
        <MetricCard icon="↗" label="Accepted / active" value={countFor('active')} />
        <MetricCard icon="✓" label="Completed" value={countFor('completed')} />
      </div>

      <nav className="application-status-filters" aria-label="Filter applicants">
        {FILTERS.map((item) => (
          <Link
            key={item.key}
            href={item.key === 'all' ? '/app/adult/applications' : `/app/adult/applications?filter=${item.key}`}
            className={`application-filter-chip ${selectedFilter === item.key ? 'active' : ''}`}
            aria-current={selectedFilter === item.key ? 'page' : undefined}
          >
            <span>{item.label}</span><span className="application-filter-count">{countFor(item.key)}</span>
          </Link>
        ))}
      </nav>

      {!apps.length ? (
        <EmptyState
          icon="◎"
          title={selectedFilter === 'all' ? 'No applicants yet' : 'No applicants in this view'}
          text={selectedFilter === 'all' ? "When teens apply to jobs you manage, their applications will appear here." : 'Try another filter or return to all applicants.'}
          href={selectedFilter === 'all' ? '/app/adult/post-job' : '/app/adult/applications'}
          action={selectedFilter === 'all' ? 'Post a job' : 'Show all applicants'}
        />
      ) : (
        <div className="grid two application-dashboard-grid">
          {apps.map((a: any) => {
            const pending = ['submitted', 'adult_review'].includes(a.status)
            const active = ['in_progress', 'proof_submitted', 'completion_pending_release'].includes(a.status)
            const waitingGuardian = a.status === 'guardian_pending'
            const canMessage = !['guardian_pending', 'guardian_rejected', 'rejected'].includes(a.status)
            const pay = a.jobs?.pay_label || (a.jobs?.pay_amount_cents ? centsToDollars(a.jobs.pay_amount_cents) : '')
            const subtitle = [
              a.profiles?.display_name || 'Teen applicant',
              [a.jobs?.city, a.jobs?.state].filter(Boolean).join(', '),
              pay,
            ].filter(Boolean).join(' · ')

            return (
              <ApplicationCard
                key={a.id}
                title={a.jobs?.title || 'Job'}
                subtitle={subtitle}
                note={a.note}
                status={a.status}
              >
                <div className="application-card-detail"><CategoryPill category={a.jobs?.category} /></div>

                {waitingGuardian && (
                  <div className="application-guardian-note">Waiting for required guardian approval. Accepting or messaging stays locked until approval is complete.</div>
                )}

                {(pending || a.status === 'accepted' || active) && (
                  <form action={setApplicationStatus} className="row-actions application-card-actions">
                    <input type="hidden" name="application_id" value={a.id} />
                    {pending && <><button name="status" value="accepted" className="btn primary sm">Accept</button><button name="status" value="rejected" className="btn sm">Decline</button></>}
                    {a.status === 'accepted' && <button name="status" value="in_progress" className="btn safe sm">Start work</button>}
                    {active && <button name="status" value="completed" className="btn safe sm">Mark completed</button>}
                  </form>
                )}

                {canMessage && (
                  <form action={startThreadFromApplication} className="row-actions application-card-actions">
                    <input type="hidden" name="application_id" value={a.id} />
                    <button className="btn ghost sm">Message applicant</button>
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
