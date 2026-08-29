// Calibrated Liquid Glass: the landing page uses refractive depth to support, not compete with, the marketplace’s real navigation and safety story.
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { CategoryTile } from '@/components/ui'
import { createClient } from '@/lib/supabase/server'

const FEATURED_CATEGORIES = [
  { category: 'tutoring', label: 'Tutoring' },
  { category: 'lawn care', label: 'Lawn care' },
  { category: 'dog walking', label: 'Dog walking' },
  { category: 'cleaning', label: 'Cleaning' },
  { category: 'errands', label: 'Errands' },
  { category: 'babysitting', label: 'Babysitting' },
  { category: 'car washing', label: 'Car washing' },
  { category: 'trash help', label: 'Trash help' },
]

const features = [
  { icon: '🔍', title: 'Teen job feed', text: 'Browse nearby dog walking, lawn care, trash help, errands, tutoring, cleaning, and simple local gigs.' },
  { icon: '✅', title: 'Verified adults only', text: 'Adults and businesses submit verification details and must be approved by a MORT admin before they can post.' },
  { icon: '🛡️', title: 'Guardian Mode', text: 'Parents connect via invite codes, see safety pings, and can pause a connected teen\'s account.' },
  { icon: '💬', title: 'Safe messaging', text: 'Messages stay inside MORT, are scanned for common risk patterns, and can be reported in one tap.' },
  { icon: '📸', title: 'Proof + completion', text: 'Teens submit proof photos and notes. Adults confirm. Admins can review any dispute.' },
  { icon: '🏆', title: 'XP + trust system', text: 'Levels, streaks, badges, challenges, and hustle history make the platform addictive and trustworthy.' },
]

const roles = [
  {
    icon: '🔥',
    title: 'For Teens',
    color: 'var(--rose-gold)',
    items: ['Browse & apply to local jobs', 'Build XP and earn badges', 'Safety check-ins & pings', 'Track earnings & applications', 'Guardian-approved safety'],
    cta: 'Start hustling',
    href: '/signup',
  },
  {
    icon: '💼',
    title: 'For Adults',
    color: 'var(--blue)',
    items: ['Post jobs after verification', 'Review teen applicants', 'Message safely inside app', 'Confirm completion & pay', 'Leave reviews & ratings'],
    cta: 'Post a job',
    href: '/signup',
  },
  {
    icon: '🛡️',
    title: 'For Guardians',
    color: 'var(--soft-pink)',
    items: ['Connect via invite code', 'See all teen applications', 'Approve or reject jobs', 'See safety pings', 'Pause a connected teen\'s account'],
    cta: 'Protect your teen',
    href: '/signup',
  },
]

const levels = [
  { level: 1, name: 'New Hustler', xp: '0 XP', cls: 'l1' },
  { level: 2, name: 'Trusted Helper', xp: '100 XP', cls: 'l2' },
  { level: 3, name: 'Local Pro', xp: '300 XP', cls: 'l3' },
  { level: 4, name: 'Verified Hustler', xp: '600 XP', cls: 'l4' },
  { level: 5, name: 'MORT Elite', xp: '1000 XP', cls: 'l5' },
]

const badges = [
  { icon: '🐕', label: 'Dog Walker' },
  { icon: '🌿', label: 'Lawn Helper' },
  { icon: '⚡', label: 'Fast Responder' },
  { icon: '⭐', label: '5-Star Worker' },
  { icon: '🛡️', label: 'Guardian Verified' },
  { icon: '✅', label: 'Safe Check-In Streak' },
  { icon: '🌅', label: 'Weekend Warrior' },
  { icon: '🏆', label: 'Top Earner' },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: openJobs } = await supabase.from('jobs').select('category').eq('status', 'open')
  const counts: Record<string, number> = {}
  for (const j of openJobs || []) {
    const key = (j.category || '').toLowerCase().trim()
    if (key) counts[key] = (counts[key] || 0) + 1
  }

  return (
    <>
      <SiteHeader isSignedIn={!!user} />
      <main>
        {/* Hero */}
        <section className="hero container hero-grid">
          <div>
            <div className="kicker">Teen-safe local hustle marketplace</div>
            <h1>Local jobs for teens.<br />Built with safety first.</h1>
            <p className="lead">MORT helps teens 13–17 find nearby real-life work while giving adults, guardians, and admins the controls needed to keep the marketplace clean and safe.</p>
            <div className="row-actions" style={{marginTop:32,gap:12}}>
              <Link className="btn primary lg" href="/signup">Create free account</Link>
              <Link className="btn lg" href="/signup?next=%2Fapp%2Fteen%2Fjobs">Browse jobs</Link>
              <Link className="btn ghost lg" href="/#how">See how it works</Link>
            </div>
            <div style={{display:'flex',gap:24,marginTop:40,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:'var(--primary)',fontSize:18}}>✓</span>
                <span style={{fontSize:14,color:'var(--muted2)'}}>Free for teens</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:'var(--accent-pink)',fontSize:18}}>✓</span>
                <span style={{fontSize:14,color:'var(--muted2)'}}>Guardian safety controls</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{color:'var(--accent-blue)',fontSize:18}}>✓</span>
                <span style={{fontSize:14,color:'var(--muted2)'}}>Verified adults only</span>
              </div>
            </div>
          </div>

          {/* Decorative preview — floating job + safety cards over a gradient-to-solid
              blob, not a flat overlay (principle 11). Demonstrates the real card
              language (JobCard / Status / role colors) instead of empty hero space. */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-visual-glow" />
            <div className="overlay-gradient-side" />
            <div className="hero-card hero-card-back">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <span className="pill blue">🐕 Dog walking</span>
                <span className="status green">Safe</span>
              </div>
              <h3 style={{fontSize:15,marginBottom:4}}>Safety check-in received</h3>
              <p style={{fontSize:12.5}}>Maya checked in at 4:12 PM — job in progress.</p>
            </div>
            <div className="hero-card hero-card-front">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                <span className="pill rose">🌿 Lawn care</span>
                <span className="status blue">Open</span>
              </div>
              <h3 style={{marginBottom:6}}>Weekend yard cleanup</h3>
              <p style={{fontSize:13,marginBottom:16}}>2 hours · Broad Ripple · Verified homeowner</p>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span className="job-card-pay">$45</span>
                <span className="status green">Verified host</span>
              </div>
            </div>
          </div>
        </section>


        {/* Popular categories — the actual point of MORT, made the biggest
            thing on the page instead of a buried filter dropdown. */}
        <section id="categories" className="section container" style={{paddingTop:0}}>
          <div className="kicker">Real local work</div>
          <h2>Tutoring. Lawn care. Dog walking. Real jobs, not gig-app filler.</h2>
          <p className="lead" style={{marginTop:8,marginBottom:32}}>Every job on MORT is something a teen can actually do nearby, for someone actually in their community.</p>
          <div className="grid four">
            {FEATURED_CATEGORIES.map(c => (
              <CategoryTile
                key={c.category}
                category={c.category}
                label={c.label}
                count={counts[c.category] || 0}
                href={`/signup?next=${encodeURIComponent(`/app/teen/jobs?category=${c.category}`)}`}
              />
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="how" className="section container">
          <div className="kicker">Platform features</div>
          <h2>Everything MORT needs in one place.</h2>
          <div className="grid three" style={{marginTop:32}}>
            {features.map(f => (
              <div className="card" key={f.title}>
                <div className="card-icon-tile">{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{marginTop:6}}>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="section container">
          <div className="kicker">Who uses MORT</div>
          <h2>Built for every person in the hustle.</h2>
          <div className="grid three" style={{marginTop:32}}>
            {roles.map(r => (
              <div className="card highlight" key={r.title} style={{borderColor:`${r.color}22`}}>
                <div style={{fontSize:32,marginBottom:12}}>{r.icon}</div>
                <h3 style={{color:r.color}}>{r.title}</h3>
                <ul style={{listStyle:'none',padding:0,margin:'12px 0 20px',display:'flex',flexDirection:'column',gap:8}}>
                  {r.items.map(item => (
                    <li key={item} style={{display:'flex',alignItems:'center',gap:8,fontSize:14,color:'var(--muted2)'}}>
                      <span style={{color:r.color,fontSize:12}}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <Link href={r.href} className="btn primary" style={{width:'100%',justifyContent:'center'}}>{r.cta}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* XP System */}
        <section className="section container">
          <div className="kicker">Gamification</div>
          <h2>Level up your hustle.</h2>
          <p className="lead" style={{marginBottom:32}}>Teens earn XP for every job completed, safety check-in, and positive review. Build your reputation from New Hustler to MORT Elite.</p>
          <div className="grid two" style={{gap:24}}>
            <div>
              <h3 style={{marginBottom:16}}>XP Levels</h3>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {levels.map(l => (
                  <div key={l.level} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',border:'1px solid var(--line)',borderRadius:12,background:'var(--surface)'}}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <span style={{fontSize:20,fontWeight:900,color:'var(--muted)',width:24,textAlign:'center'}}>{l.level}</span>
                      <span className={`level-badge ${l.cls}`}>Lv{l.level} {l.name}</span>
                    </div>
                    <span style={{fontSize:12,color:'var(--muted)'}}>{l.xp}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{marginBottom:16}}>Badges you can earn</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                {badges.map(b => (
                  <span key={b.label} className="badge-chip earned">{b.icon} {b.label}</span>
                ))}
              </div>
              <div className="card" style={{marginTop:20,borderColor:'rgba(232,182,164,0.2)'}}>
                <h4 style={{color:'var(--muted)',marginBottom:8}}>Trust Score</h4>
                <p style={{fontSize:14}}>Your trust score is built from completed jobs, average rating, response rate, and safety check-in reliability. Adults see it before accepting you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Safety */}
        <section className="section container">
          <div className="kicker">Safety first</div>
          <h2>The safest way for teens to work locally.</h2>
          <div className="grid three" style={{marginTop:32}}>
            <div className="card danger-card">
              <div className="card-icon-tile">🚨</div>
              <h3>SOS Button</h3>
              <p>One tap sends an emergency ping to guardians and admins with your last known job location.</p>
            </div>
            <div className="card highlight">
              <div className="card-icon-tile blue">✅</div>
              <h3>Safety Check-ins</h3>
              <p>Teens check in when they arrive, start, and finish. Guardians see every ping the next time they open MORT.</p>
            </div>
            <div className="card">
              <div className="card-icon-tile">🛡️</div>
              <h3>Adult Verification</h3>
              <p>Every adult is reviewed by admins before they can post jobs or contact teens.</p>
            </div>
            <div className="card">
              <div className="card-icon-tile blue">👁️</div>
              <h3>Guardian Mode</h3>
              <p>Parents connect via invite code and can approve jobs, see activity, and pause a connected teen&apos;s account.</p>
            </div>
            <div className="card">
              <div className="card-icon-tile yellow">💬</div>
              <h3>Monitored Messages</h3>
              <p>All messages stay inside MORT. Suspicious language triggers automatic flags for review.</p>
            </div>
            <div className="card">
              <div className="card-icon-tile yellow">⚠️</div>
              <h3>Report System</h3>
              <p>Any user can report jobs, messages, or accounts. Reports go straight to MORT admins for review.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section container" style={{textAlign:'center',paddingBottom:80}}>
          <div style={{maxWidth:600,margin:'0 auto'}}>
            <div className="kicker" style={{justifyContent:'center'}}>Ready to hustle?</div>
            <h2>Start earning today.</h2>
            <p className="lead" style={{margin:'16px auto 32px'}}>Join thousands of teens finding safe local work in their neighborhood. Free to join, free to apply.</p>
            <div className="row-actions" style={{justifyContent:'center',gap:12}}>
              <Link className="btn primary lg" href="/signup">Create free account</Link>
              <Link className="btn lg" href="/login">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link href="/" className="logo" style={{marginBottom:16}}>
                <span className="logo-mark">M</span>
                <span>MORT</span>
              </Link>
              <p style={{fontSize:13,maxWidth:260,marginTop:12}}>The teen-safe local hustle marketplace. Connecting teens 13–17 with safe local work opportunities.</p>
            </div>
            <div>
              <h4 style={{marginBottom:12}}>Platform</h4>
              <div className="footer-links">
                <Link href="/#how">How it works</Link>
                <Link href="/#roles">For teens</Link>
                <Link href="/#roles">For adults</Link>
                <Link href="/safety">Safety</Link>
              </div>
            </div>
            <div>
              <h4 style={{marginBottom:12}}>Legal</h4>
              <div className="footer-links">
                <Link href="/legal/terms">Terms of service</Link>
                <Link href="/legal/privacy">Privacy policy</Link>
              </div>
            </div>
            <div>
              <h4 style={{marginBottom:12}}>Account</h4>
              <div className="footer-links">
                <Link href="/signup">Create account</Link>
                <Link href="/login">Login</Link>
                <Link href="/signup?next=%2Fapp%2Fteen%2Fjobs">Browse jobs</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 MORT. Teen-safe local hustle marketplace.</span>
            <span>Not a payment processor. Users record a payment preference off-platform.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
