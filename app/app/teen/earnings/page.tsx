import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, Status, MetricCard } from '@/components/ui'
import { CountUp } from '@/components/count-up'
export const dynamic = 'force-dynamic'

export default async function Earnings() {
  const { supabase, user } = await requireRole(['teen'])
  const { data: assignments, error } = await supabase.from('job_assignments')
    .select('id, status, agreed_amount, accepted_at, completed_by_teen_at, completed_by_adult_at, jobs(title, category, city, region, pay_amount_cents, pay_label)')
    .eq('teen_user_id', user.id).order('created_at', { ascending: false })
  const completed = (assignments || []).filter((item: any) => item.status === 'completed')
  const active = (assignments || []).filter((item: any) => !['completed', 'cancelled', 'disputed'].includes(item.status))
  const totalCents = completed.reduce((sum: number, item: any) => sum + Number(item.jobs?.pay_amount_cents || 0), 0)

  return (
    <>
      <PageHeaderWithActions title="Assignment history" eyebrow="Compensation overview" description="This is an estimate based on completed assignment records, not proof of payment. MORT does not process or guarantee compensation." />
      {error && <div className="error">Assignment history could not be loaded.</div>}
      <div className="stats" style={{ marginBottom: 24 }}>
        <MetricCard icon="💰" label="Estimated completed value" value={<CountUp value={Math.round(totalCents / 100)} prefix="$" />} sub="not verified as paid" />
        <MetricCard icon="✅" label="Completed assignments" value={<CountUp value={completed.length} />} />
        <MetricCard icon="⚙️" label="Open assignments" value={<CountUp value={active.length} />} />
        <MetricCard icon="📋" label="Total assignments" value={<CountUp value={assignments?.length || 0} />} />
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Job history</h3>
        {!assignments?.length ? <p style={{ color: 'var(--muted2)' }}>No accepted assignments yet.</p> : <div className="table-wrap"><table className="table">
          <thead><tr><th>Job</th><th>Category</th><th>Location</th><th>Listed pay</th><th>Assignment status</th></tr></thead>
          <tbody>{assignments.map((item: any) => <tr key={item.id}>
            <td>{item.jobs?.title || 'Job'}</td><td>{item.jobs?.category}</td><td>{[item.jobs?.city, item.jobs?.region].filter(Boolean).join(', ')}</td><td>{item.jobs?.pay_label || centsToDollars(item.jobs?.pay_amount_cents)}</td><td><Status value={item.status} /></td>
          </tr>)}</tbody>
        </table></div>}
      </div>
    </>
  )
}