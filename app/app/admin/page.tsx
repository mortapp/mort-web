import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, MetricCard } from '@/components/ui'
import { CountUp } from '@/components/count-up'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Admin({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const sp = await searchParams
  const { supabase } = await requireRole(['admin'])
  const [{ data: cases, error: casesError }, { data: reports, error: reportsError }, { data: jobs, error: jobsError }, { count: usersCount }] = await Promise.all([
    supabase.from('verification_cases').select('id, user_id, verification_type, status, provider, submitted_at, reviewer_note').order('created_at', { ascending: false }).limit(50),
    supabase.from('safety_reports').select('id, reporter_id, reported_user_id, job_id, category, severity, status, description, immediate_danger, created_at').order('created_at', { ascending: false }).limit(50),
    supabase.from('jobs').select('id, title, category, status, safety_review_status, created_at').eq('safety_review_status', 'pending').order('created_at', { ascending: false }).limit(50),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])
  const openReports = (reports || []).filter((report: any) => !['resolved', 'dismissed'].includes(report.status)).length
  const pendingCases = (cases || []).filter((item: any) => ['pending', 'needs_review'].includes(item.status)).length

  return (
    <>
      <PageHeaderWithActions title="Admin operations" eyebrow="Restricted staff workspace" description="Review production records through the approved staff workflow. Sensitive actions remain unavailable where the production backend has no authorized review RPC." />
      <Toast message={sp?.message} />
      <div className="notice" style={{ marginBottom: 20 }}>
        <strong>Staff-only, read-only workspace.</strong>
        <p>Production row-level security checks actual staff assignments for these records. A profile role by itself does not grant access; if a section is empty, confirm the account has an active staff assignment. No admin mutations are exposed here.</p>
      </div>
      <div className="stats" style={{ marginBottom: 24 }}>
        <MetricCard icon="users" label="Visible profiles" value={<CountUp value={usersCount || 0} />} />
        <MetricCard icon="id-card" label="Verification cases" value={<CountUp value={pendingCases} />} />
        <MetricCard icon="alert-triangle" label="Open safety reports" value={<CountUp value={openReports} />} />
        <MetricCard icon="briefcase" label="Jobs awaiting safety review" value={<CountUp value={jobs?.length || 0} />} />
      </div>
      {casesError && <div className="error">Verification cases could not be loaded.</div>}
      <section className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14 }}>Verification cases</h3>
        {!cases?.length ? <p>No verification cases are available.</p> : <div className="table-wrap"><table className="table">
          <thead><tr><th>User</th><th>Type</th><th>Provider</th><th>Status</th><th>Submitted</th><th>Reviewer note</th></tr></thead>
          <tbody>{cases.map((item: any) => <tr key={item.id}><td>{item.user_id}</td><td>{item.verification_type}</td><td>{item.provider || 'Not assigned'}</td><td><Status value={item.status} /></td><td>{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : '—'}</td><td>{item.reviewer_note || '—'}</td></tr>)}</tbody>
        </table></div>}
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted2)' }}>Identity-provider submissions are currently disabled. Do not mark a person verified without independently validated evidence and the approved provider workflow.</p>
      </section>
      {reportsError && <div className="error">Safety reports could not be loaded.</div>}
      <section className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14 }}>Safety reports</h3>
        {!reports?.length ? <p>No safety reports have been submitted.</p> : <div className="table-wrap"><table className="table">
          <thead><tr><th>Category</th><th>Severity</th><th>Immediate danger</th><th>Status</th><th>Created</th><th>Details</th></tr></thead>
          <tbody>{reports.map((report: any) => <tr key={report.id}><td>{report.category}</td><td><Status value={report.severity} /></td><td>{report.immediate_danger ? 'Yes' : 'No'}</td><td><Status value={report.status} /></td><td>{new Date(report.created_at).toLocaleString()}</td><td>{report.description}</td></tr>)}</tbody>
        </table></div>}
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted2)' }}>Report-status mutation is not exposed by the current production backend. This screen is intentionally read-only rather than writing directly to safety_reports.</p>
      </section>
      {jobsError && <div className="error">Jobs awaiting review could not be loaded.</div>}
      <section className="card">
        <h3 style={{ marginBottom: 14 }}>Jobs awaiting safety review</h3>
        {!jobs?.length ? <p>No jobs are awaiting safety review.</p> : <div className="table-wrap"><table className="table">
          <thead><tr><th>Job</th><th>Category</th><th>Lifecycle</th><th>Safety review</th></tr></thead>
          <tbody>{jobs.map((job: any) => <tr key={job.id}><td>{job.title}</td><td>{job.category}</td><td><Status value={job.status} /></td><td><Status value={job.safety_review_status} /></td></tr>)}</tbody>
        </table></div>}
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted2)' }}>Job-review mutations must use the production review RPC; no direct table updates are performed by this page.</p>
      </section>
    </>
  )
}