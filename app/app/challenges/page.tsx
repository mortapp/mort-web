import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions, XPBar } from '@/components/ui'
export const dynamic = 'force-dynamic'

const weeklyChallenge = {
  title: 'Weekend Warrior',
  description: 'Complete 2 jobs this weekend to earn the Weekend Warrior badge and bonus XP.',
  xp: 150,
  deadline: 'Ends Sunday',
  progress: 0,
  total: 2,
}

const challenges = [
  {
    icon: '🐕',
    title: 'Dog Walker',
    description: 'Complete 3 dog walking jobs',
    xp: 75,
    progress: 0,
    total: 3,
    active: true,
  },
  {
    icon: '⚡',
    title: 'Fast Responder',
    description: 'Apply to a job within 1 hour of it being posted',
    xp: 50,
    progress: 0,
    total: 1,
    active: true,
  },
  {
    icon: '⭐',
    title: '5-Star Worker',
    description: 'Receive a 5-star review from an adult',
    xp: 100,
    progress: 0,
    total: 1,
    active: true,
  },
  {
    icon: '✅',
    title: 'Safe Check-In Streak',
    description: 'Check in safely on 5 consecutive jobs',
    xp: 80,
    progress: 0,
    total: 5,
    active: true,
  },
  {
    icon: '🌿',
    title: 'Lawn Helper',
    description: 'Complete 2 lawn care or outdoor jobs',
    xp: 60,
    progress: 0,
    total: 2,
    active: true,
  },
  {
    icon: '💬',
    title: 'Communicator',
    description: 'Send 10 messages to adults about jobs',
    xp: 40,
    progress: 0,
    total: 10,
    active: true,
  },
  {
    icon: '🛡️',
    title: 'Guardian Connected',
    description: 'Connect a guardian to your account',
    xp: 100,
    progress: 0,
    total: 1,
    active: true,
  },
  {
    icon: '🔥',
    title: 'First Hustle',
    description: 'Complete your very first job on MORT',
    xp: 50,
    progress: 0,
    total: 1,
    active: true,
  },
  {
    icon: '💰',
    title: 'Money Maker',
    description: 'Track $100+ in earnings on MORT',
    xp: 200,
    progress: 0,
    total: 100,
    active: false,
  },
]

export default async function Challenges() {
  const { profile } = await requireUser()
  const xp = profile?.xp_points || 0

  function getLevelInfo(xp: number) {
    if (xp < 100) return { level: 1, name: 'New Hustler', next: 100 }
    if (xp < 300) return { level: 2, name: 'Trusted Helper', next: 300 }
    if (xp < 600) return { level: 3, name: 'Local Pro', next: 600 }
    if (xp < 1000) return { level: 4, name: 'Verified Hustler', next: 1000 }
    return { level: 5, name: 'MORT Elite', next: 1000 }
  }

  const lvl = getLevelInfo(xp)

  return (
    <>
      <PageHeaderWithActions
        title="Challenges"
        eyebrow="Gamification"
        description="Complete challenges to earn XP, unlock badges, and level up your hustle."
      />

      {/* XP Progress */}
      <div className="card" style={{marginBottom:24}}>
        <h3 style={{marginBottom:16}}>Your XP progress</h3>
        <XPBar current={xp} max={lvl.next} level={lvl.level} levelName={lvl.name} />
        <div style={{display:'flex',gap:16,marginTop:16,flexWrap:'wrap'}}>
          {[
            { label:'Total XP', value:xp, color:'var(--warning)' },
            { label:'Current level', value:`Lv${lvl.level}`, color:'var(--primary)' },
            { label:'Next level at', value:`${lvl.next} XP`, color:'var(--muted2)' },
          ].map(s => (
            <div key={s.label} style={{flex:1,minWidth:100,padding:'12px 16px',border:'1px solid var(--border)',borderRadius:12,background:'var(--bg-sunken)'}}>
              <div style={{fontSize:11,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:800,letterSpacing:'-0.03em',color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly challenge */}
      <div className="challenge-card active-challenge" style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:12}}>
            <div className="icon-tile-sm">🌅</div>
            <div>
              <div style={{fontSize:11,color:'var(--primary)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2}}>Weekly challenge</div>
              <h3 style={{margin:0}}>{weeklyChallenge.title}</h3>
              <p style={{fontSize:14,marginTop:6}}>{weeklyChallenge.description}</p>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
            <span className="challenge-xp">+{weeklyChallenge.xp} XP</span>
            <span style={{fontSize:12,color:'var(--muted)'}}>{weeklyChallenge.deadline}</span>
          </div>
        </div>
        <div style={{marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--muted)',marginBottom:6}}>
            <span>Progress</span>
            <span>{weeklyChallenge.progress}/{weeklyChallenge.total} jobs</span>
          </div>
          <div className="xp-bar-wrap">
            <div className="xp-bar" style={{width:`${(weeklyChallenge.progress/weeklyChallenge.total)*100}%`}} />
          </div>
        </div>
      </div>

      {/* All challenges */}
      <h3 style={{marginBottom:16}}>All challenges</h3>
      <div className="grid three">
        {challenges.map(c => (
          <div key={c.title} className={`challenge-card ${c.active ? 'active-challenge' : ''}`}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:12}}>
              <div className="icon-tile-sm">{c.icon}</div>
              <span className="challenge-xp">+{c.xp} XP</span>
            </div>
            <h3 style={{marginBottom:6}}>{c.title}</h3>
            <p style={{fontSize:13,marginBottom:16}}>{c.description}</p>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--muted)',marginBottom:5}}>
                <span>Progress</span>
                <span>{c.progress}/{c.total}</span>
              </div>
              <div className="xp-bar-wrap">
                <div className="xp-bar" style={{width:`${(c.progress/c.total)*100}%`}} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Safety note */}
      <div className="card info-card" style={{marginTop:24}}>
        <h4 style={{marginBottom:8}}>🛡️ Safety-gated challenges</h4>
        <p style={{fontSize:14}}>Challenges never incentivize unsafe behavior. Guardian controls and reporting remain active at all times. Challenges are earned through safe, completed work only.</p>
      </div>
    </>
  )
}
