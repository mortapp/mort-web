import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, Status, EmptyState, CategoryPill } from '@/components/ui'
import { setJobStatus } from '../actions'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function MyJobs({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase, user } = await requireRole(['adult'])
  const { data: jobs, error } = await supabase.from('jobs').select('*').eq('poster_id', user.id).order('created_at', { ascending: false })

  return (
    <>
      <PageHeaderWithActions title="My posted jobs" eyebrow="Adult" description="Manage the jobs you've posted.">
        <Link href="/app/adult/post-job" className="btn primary">+ Post a job</Link>
      </PageHeaderWithActions>
      <Toast message={sp?.message} />

      {error && <div className="error">Your jobs could not be loaded.</div>}
      {!jobs?.length ? (
        <EmptyState icon="📁" title="No jobs yet" text="Post your first job." href="/app/adult/post-job" action="Post job" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.map((j: any) => (
            <div className="job-card" key={j.id} style={{ cursor: 'default' }}>
              <div className={`job-card-icon ${j.status === 'open' ? 'rose' : 'muted'}`}>💼</div>
              <div className="job-card-body">
                <div className="job-card-top-row">
                  <h3 className="job-card-title">{j.title}</h3>
                  <span className="job-card-pay">{j.pay_label || centsToDollars(j.pay_amount_cents)}</span>
                </div>
                <div className="job-card-meta">{j.category} · {j.city}, {j.region}</div>
                <div className="job-card-badges">
                  <Status value={j.status} />
                </div>
                <div className="row-actions" style={{ marginTop: 10 }}>
                  <Link className="btn sm" href={`/app/adult/jobs/${j.id}`}>Open applicants</Link>
                  <form action={setJobStatus}>
                    <input type="hidden" name="job_id" value={j.id} />
                    <input type="hidden" name="status" value={j.status === 'open' ? 'paused' : 'open'} />
                    <button className="btn ghost sm">{j.status === 'open' ? 'Pause' : 'Reopen'}</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
