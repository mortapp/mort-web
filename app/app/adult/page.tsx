import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, EmptyState } from '@/components/ui'
import { centsToDollars } from '@/lib/money'
import { productionCapabilities } from '@/lib/production-capabilities'

export const dynamic = 'force-dynamic'

export default async function AdultHome() {
  const { supabase, user, profile } = await requireRole(['adult'])
  const [{ data: jobs, error: jobsError }, { data: runtime, error: runtimeError }] = await Promise.all([
    supabase.from('jobs').select('id, title, category, status, city, region, pay_amount_cents, created_at').eq('poster_id', user.id).order('created_at', { ascending: false }).limit(6),
    supabase.rpc('get_runtime_feature_status'),
  ])
  const isVerified = profile?.verification_status === 'approved'
  const canPublish = !runtimeError && runtime?.new_job_publishing_disabled === false && runtime?.payments_disabled === false && productionCapabilities.perTaskGuardianApproval && isVerified

  return (
    <>
      <PageHeaderWithActions title="Your work, close to home" eyebrow="Home" description="Keep your listings and applicant activity connected to one clear job workflow.">
        {canPublish ? <Link href="/app/adult/post-job" className="btn primary"><span aria-hidden="true">+</span> Post a job</Link> : <Link href={isVerified ? '/app/adult/post-job' : '/app/verify'} className="btn">{isVerified ? 'View posting requirements' : 'View verification'}</Link>}
      </PageHeaderWithActions>

      {!isVerified && <div className="notice" style={{ marginBottom: 20 }}><strong>Adult verification required</strong><p>Complete the available verification steps before job publishing can be enabled.</p><Link href="/app/verify" className="text-link">Review verification status</Link></div>}
      {isVerified && !canPublish && <div className="notice" style={{ marginBottom: 20 }}><strong>Job publishing is temporarily unavailable</strong><p>MORT is keeping new listings disabled until identity verification, payment funding, and per-Task Guardian approval are supported. You can still manage existing jobs and review applicants.</p></div>}

      <div className="adult-home-grid">
        <section className="card">
          <div className="section-heading-row"><div><h2>Your jobs</h2><p>Listings you have created and their current state.</p></div><Link href="/app/adult/jobs" className="text-link">View all</Link></div>
          {jobsError ? <p role="status">Your jobs could not be loaded. Refresh to try again.</p> : !jobs?.length ? <EmptyState icon="briefcase" title="Your first job starts here" text="When publishing is available, create a clear, age-appropriate local listing." /> : (
            <div className="adult-recent-jobs">
              {jobs.map((job: any) => <Link href={`/app/adult/jobs/${job.id}`} className="adult-recent-job" key={job.id}>
                <div className="adult-recent-job-main"><h3>{job.title}</h3><p>{[job.city, job.region].filter(Boolean).join(', ') || 'Location not listed'} · {job.category}</p></div>
                <div className="adult-recent-job-meta"><strong>{centsToDollars(job.pay_amount_cents)}</strong><Status value={job.status} /></div>
              </Link>)}
            </div>
          )}
        </section>

        <aside className="adult-home-side">
          <Link href="/app/adult/applications" className="card adult-action-card"><span className="adult-action-icon"><span aria-hidden="true">↗</span></span><div><h3>Review applicants</h3><p>Review applications attached to your own jobs.</p></div></Link>
          <Link href="/app/verify" className="card adult-action-card"><span className="adult-action-icon"><span aria-hidden="true">✓</span></span><div><h3>Verification</h3><p>See your current verification status and available next steps.</p></div></Link>
          <div className="card adult-payment-note"><h3>Payments</h3><p>MORT payment processing and payouts are not enabled. Do not represent a job as funded or a teen as paid through MORT.</p><Link href="/app/payments" className="text-link">Payment information</Link></div>
        </aside>
      </div>
    </>
  )
}
