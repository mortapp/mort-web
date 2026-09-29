import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { PageHeaderWithActions, Status, MetricCard } from '@/components/ui'
import { CountUp } from '@/components/count-up'
export const dynamic = 'force-dynamic'

export default async function Adult() {
  const { supabase, user, profile } = await requireRole(['adult','admin'])
  const { data: myJobIds } = await supabase.from('jobs').select('id').eq('poster_id', user.id)
  const jobIdList = (myJobIds || []).map((j: any) => j.id)
  const [
    { count: jobsCount },
    { count: appsCount },
  ] = await Promise.all([
    Promise.resolve({ count: jobIdList.length }),
    jobIdList.length
      ? supabase.from('applications').select('id', { count: 'exact', head: true }).in('job_id', jobIdList).in('status', ['submitted','adult_review'])
      : Promise.resolve({ count: 0 }),
  ])

  const isApproved = profile?.role === 'admin' || profile?.verification_status === 'approved'

  return (
    <>
      <PageHeaderWithActions
        title="Adult / Business"
        eyebrow="Post local jobs"
        description="Hire verified teens for local tasks."
      >
        <Status value={profile?.verification_status} />
        {isApproved && <Link href="/app/adult/post-job" className="btn primary">+ Post job</Link>}
      </PageHeaderWithActions>

      {!isApproved && (
        <div className="warning-box" style={{marginBottom:24}}>
          <strong>⚠️ Verification required before posting</strong>
          <p style={{marginTop:6,fontSize:14}}>Adults must be verified by MORT admin before posting jobs or accepting teen workers. <a href="/app/verify" style={{color:'var(--warning)',fontWeight:600}}>Submit verification →</a></p>
        </div>
      )}

      <div className="stats" style={{marginBottom:24}}>
        <MetricCard icon="💼" label="My jobs posted" value={<CountUp value={jobsCount || 0} />} />
        <MetricCard icon="👥" label="Pending applicants" value={<CountUp value={appsCount || 0} />} color={appsCount ? 'var(--warning)' : undefined} />
        <MetricCard icon="✅" label="Verification" value={<Status value={profile?.verification_status} />} />
        <MetricCard icon="🪪" label="Role" value={<span style={{textTransform:'capitalize'}}>{profile?.role}</span>} />
      </div>

      <div className="grid three">
        <Link className="card" href="/app/verify" style={{textDecoration:'none'}}>
          <div className="card-icon-tile blue">✅</div>
          <h3>Verify account</h3>
          <p style={{fontSize:14,marginTop:6}}>Submit or check your adult/business verification status.</p>
          <div style={{marginTop:16}}><Status value={profile?.verification_status} /></div>
        </Link>
        <Link className={`card ${isApproved ? 'highlight' : ''}`} href="/app/adult/post-job" style={{textDecoration:'none'}}>
          <div className="card-icon-tile">➕</div>
          <h3>Post a job</h3>
          <p style={{fontSize:14,marginTop:6}}>Create a local teen-safe job listing in your area.</p>
          {!isApproved && <p style={{fontSize:12,color:'var(--danger)',marginTop:8}}>Requires verification</p>}
        </Link>
        <Link className="card" href="/app/adult/applications" style={{textDecoration:'none'}}>
          <div className="card-icon-tile yellow">👥</div>
          <h3>Review applicants</h3>
          <p style={{fontSize:14,marginTop:6}}>Accept, reject, complete, or dispute applications.</p>
          {(appsCount || 0) > 0 && <div style={{marginTop:12,fontSize:13,color:'var(--warning)',fontWeight:700}}>{appsCount} pending</div>}
        </Link>
        <Link className="card" href="/app/adult/jobs" style={{textDecoration:'none'}}>
          <div className="card-icon-tile">📁</div>
          <h3>My jobs</h3>
          <p style={{fontSize:14,marginTop:6}}>View and manage all your posted job listings.</p>
        </Link>
        <Link className="card" href="/app/messages" style={{textDecoration:'none'}}>
          <div className="card-icon-tile blue">💬</div>
          <h3>Messages</h3>
          <p style={{fontSize:14,marginTop:6}}>Communicate with accepted teen workers safely.</p>
        </Link>
        <Link className="card" href="/app/payments" style={{textDecoration:'none'}}>
          <div className="card-icon-tile">💳</div>
          <h3>Payment prefs</h3>
          <p style={{fontSize:14,marginTop:6}}>Set your preferred payment method for teens.</p>
        </Link>
      </div>
    </>
  )
}
