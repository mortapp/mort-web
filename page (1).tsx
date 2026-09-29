import { requireRole } from '@/lib/auth'
import { centsToDollars } from '@/lib/money'
import { PageHeaderWithActions, Status, MetricCard } from '@/components/ui'
import { CountUp } from '@/components/count-up'
import { Sparkline } from '@/components/sparkline'
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

  // Monthly earnings series for the sparkline — completed pay bucketed over the
  // last 6 months (empty months included so the line has a real shape).
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString('en-US', { month: 'short' }), cents: 0 }
  })
  const monthIdx: Record<string, number> = {}
  months.forEach((m, i) => { monthIdx[m.key] = i })
  for (const a of apps || []) {
    if (a.status !== 'completed' || !a.created_at) continue
    const d = new Date(a.created_at)
    const k = `${d.getFullYear()}-${d.getMonth()}`
    if (k in monthIdx) months[monthIdx[k]].cents += (a.jobs?.pay_amount_cents || 0)
  }
  const series = months.map(m => Math.round(m.cents / 100))

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

      <div className="card" style={{marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,gap:12,flexWrap:'wrap'}}>
          <h3>Earnings over time</h3>
          <span className="small">last 6 months</span>
        </div>
        <Sparkline data={series} height={110} ariaLabel="Tracked earnings over the last 6 months" />
        <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
          {months.map(m => (
            <span key={m.key} style={{fontSize:11,fontWeight:600,color:'var(--muted)'}}>{m.label}</span>
          ))}
        </div>
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
