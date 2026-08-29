import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, Status, MetricCard } from '@/components/ui'
import { CountUp } from '@/components/count-up'
export const dynamic = 'force-dynamic'

export default async function Earnings() {
  const { supabase, user } = await requireRole(['teen'])
  const { data: apps } = await supabase
    .from('applications')
    .select('*, jobs(pay_amount_cents,pay_label,title,category,city,state)')
    .eq('teen_id', user.id)
    .in('status', ['completed','accepted'])
    .order('created_at', {ascending:false})

  const total = (apps||[]).reduce((s: number, a: any) => s + (a.jobs?.pay_amount_cents || 0), 0)
  const completed = (apps||[]).filter((a: any) => a.status === 'completed').length
  const active = (apps||[]).filter((a: any) => a.status === 'accepted').length

  return (
    <>
      <PageHeaderWithActions
        title="Earnings ledger"
        eyebrow="Cash / Cash App"
        description="This is a record ledger, not a payment processor. MORT tracks what you earned."
      />

      <div className="stats" style={{marginBottom:24}}>
        <MetricCard icon="💰" label="Tracked earnings" value={<CountUp value={Math.round(total/100)} prefix="$" />} sub="potential pay" color="var(--primary)" />
        <MetricCard icon="✅" label="Completed jobs" value={<CountUp value={completed} />} />
        <MetricCard icon="⚙️" label="Active jobs" value={<CountUp value={active} />} color={active ? 'var(--warning)' : undefined} />
        <MetricCard icon="📋" label="Total tracked" value={<CountUp value={apps?.length || 0} />} />
      </div>

      <div className="card">
        <h3 style={{marginBottom:16}}>Job history</h3>
        {!apps?.length ? (
          <div style={{textAlign:'center',padding:'32px 0',color:'var(--muted)'}}>
            <div style={{fontSize:32,marginBottom:8}}>💰</div>
            <p>No completed jobs yet. Apply to jobs to start earning.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Pay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a: any) => (
                  <tr key={a.id}>
                    <td style={{fontWeight:600}}>{a.jobs?.title}</td>
                    <td style={{color:'var(--muted2)',fontSize:13}}>{a.jobs?.category}</td>
                    <td style={{color:'var(--muted2)',fontSize:13}}>{a.jobs?.city}, {a.jobs?.state}</td>
                    <td style={{color:'var(--primary)',fontWeight:700}}>{a.jobs?.pay_label || centsToDollars(a.jobs?.pay_amount_cents)}</td>
                    <td><Status value={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card info-card" style={{marginTop:16}}>
        <h4 style={{marginBottom:8}}>💳 Payment info</h4>
        <p style={{fontSize:14}}>MORT records earnings but does not process payments. Adults pay via cash or Cash App after job completion. Always confirm payment method before starting a job.</p>
      </div>
    </>
  )
}
