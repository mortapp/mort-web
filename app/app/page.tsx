import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, Status, XPBar, BadgeRow, MetricCard } from '@/components/ui'
import { CountUp } from '@/components/count-up'
export const dynamic = 'force-dynamic'

function getLevelInfo(xp: number) {
  if (xp < 100) return { level: 1, name: 'New Hustler', next: 100 }
  if (xp < 300) return { level: 2, name: 'Trusted Helper', next: 300 }
  if (xp < 600) return { level: 3, name: 'Local Pro', next: 600 }
  if (xp < 1000) return { level: 4, name: 'Verified Hustler', next: 1000 }
  return { level: 5, name: 'MORT Elite', next: 1000 }
}

export default async function Dashboard() {
  const { supabase, user, profile } = await requireUser()
  const [
    { count: jobsCount },
    { count: appsCount },
    { count: activeCount },
    { count: reportsCount }
  ] = await Promise.all([
    supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status','open'),
    supabase.from('applications').select('id', { count: 'exact', head: true }).or(`teen_id.eq.${user.id}`),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('teen_id', user.id).eq('status','accepted'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('reporter_id', user.id),
  ])

  const xp = profile?.xp_points || 0
  const lvl = getLevelInfo(xp)
  const role = profile?.role || 'none'

  const allBadges = [
    { icon: '🐕', label: 'Dog Walker', earned: false },
    { icon: '🌿', label: 'Lawn Helper', earned: false },
    { icon: '⚡', label: 'Fast Responder', earned: false },
    { icon: '⭐', label: '5-Star Worker', earned: false },
    { icon: '🛡️', label: 'Guardian Verified', earned: !!profile?.guardian_required },
    { icon: '✅', label: 'Safe Check-In', earned: false },
    { icon: '🌅', label: 'Weekend Warrior', earned: false },
  ]

  return (
    <>
      <PageHeaderWithActions
        title="MORT Dashboard"
        eyebrow="Command center"
        description="Your hub for jobs, safety, and hustle progress."
      >
        <Link href="/app/teen/jobs" className="btn primary">Browse jobs</Link>
      </PageHeaderWithActions>

      {/* Stats — icon-first, the number is the visual anchor for each metric */}
      <div className="stats">
        <MetricCard icon="🪪" label="Role" value={<span style={{textTransform:'capitalize'}}>{role}</span>} sub={<Status value={profile?.verification_status} />} />
        <MetricCard icon="💼" label="Open jobs" value={<CountUp value={jobsCount ?? 0} />} sub="available now" color="var(--primary)" />
        <MetricCard icon="📋" label="Applications" value={<CountUp value={appsCount ?? 0} />} sub={`${activeCount ?? 0} active`} />
        <MetricCard icon="⚡" label="XP points" value={<CountUp value={xp} />} sub={`Level ${lvl.level} — ${lvl.name}`} color="var(--warning)" />
      </div>

      {/* XP Progress */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{marginBottom:16}}>Your hustle progress</h3>
        <XPBar current={xp} max={lvl.next} level={lvl.level} levelName={lvl.name} />
        <div style={{marginTop:20}}>
          <h4 style={{marginBottom:12}}>Badges</h4>
          <BadgeRow badges={allBadges} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid three" style={{marginBottom:24}}>
        <Link className="card hoverable" href="/app/onboarding" style={{textDecoration:'none'}}>
          <div className="card-icon-tile">🎯</div>
          <h3>1. Onboarding</h3>
          <p style={{fontSize:'var(--text-sm)',marginTop:6}}>Choose role, city, DOB, skills, and payment preference.</p>
          <div style={{marginTop:16}}>
            <span className="btn sm" style={{display:'inline-flex'}}>Complete setup →</span>
          </div>
        </Link>
        <Link className="card hoverable" href="/app/verify" style={{textDecoration:'none'}}>
          <div className="card-icon-tile blue">✅</div>
          <h3>2. Verification</h3>
          <p style={{fontSize:'var(--text-sm)',marginTop:6}}>Teen setup, guardian invite, or adult/business verification.</p>
          <div style={{marginTop:16}}>
            <Status value={profile?.verification_status} />
          </div>
        </Link>
        <Link className="card highlight hoverable" href="/app/teen/jobs" style={{textDecoration:'none'}}>
          <div className="card-icon-tile yellow">🔍</div>
          <h3>3. Find jobs</h3>
          <p style={{fontSize:'var(--text-sm)',marginTop:6}}>Browse and apply to real local jobs once your role is ready.</p>
          <div style={{marginTop:16}}>
            <span style={{fontSize:'var(--text-sm)',color:'var(--primary)',fontWeight:700}}>{jobsCount ?? 0} open jobs →</span>
          </div>
        </Link>
      </div>

      {/* Role-specific quick links */}
      {role === 'teen' && (
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{marginBottom:16}}>Teen quick actions</h3>
          <div className="grid four">
            {[
              { href:'/app/teen/applications', icon:'📋', label:'Applications' },
              { href:'/app/teen/active', icon:'⚙️', label:'Active jobs' },
              { href:'/app/teen/earnings', icon:'💰', label:'Earnings' },
              { href:'/app/challenges', icon:'🏆', label:'Challenges' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="quick-link">
                <span className="quick-link-icon">{item.icon}</span>
                <span style={{fontSize:'var(--text-sm)',fontWeight:600,color:'var(--muted2)'}}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {role === 'adult' && (
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{marginBottom:16}}>Adult quick actions</h3>
          <div className="grid four">
            {[
              { href:'/app/adult/post-job', icon:'➕', label:'Post job' },
              { href:'/app/adult/jobs', icon:'📁', label:'My jobs' },
              { href:'/app/adult/applications', icon:'👥', label:'Applicants' },
              { href:'/app/verify', icon:'✅', label:'Verification' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="quick-link">
                <span className="quick-link-icon">{item.icon}</span>
                <span style={{fontSize:'var(--text-sm)',fontWeight:600,color:'var(--muted2)'}}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Safety reminder — blue is the "trust" semantic, not a success state */}
      <div className="card info-card">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div>
            <h3 style={{marginBottom:6}}>🛡️ Safety center</h3>
            <p style={{fontSize:'var(--text-sm)'}}>Check in on active jobs, send safety pings, or report issues.</p>
          </div>
          <div style={{display:'flex',gap:10}}>
            <Link href="/app/safety" className="btn safe">Safety center</Link>
            <Link href="/app/reports/new" className="btn danger">Report issue</Link>
          </div>
        </div>
      </div>
    </>
  )
}
