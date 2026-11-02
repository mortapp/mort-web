// MORT homepage — an immersive night: the voyage fills the hero, the job lifecycle
// is drawn as a "crossing," and the sections stay restrained and editorial.
import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { MortHero } from '@/components/mort-hero'
import { MortVoyage } from '@/components/mort-voyage'
import { Logomark } from '@/components/logomark'
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

const crossing: [string, string][] = [
  ['Discover', 'A teen sees a job nearby — without exposing unnecessary private location.'],
  ['Apply', 'A quick application. MORT never pretends the teen was already accepted.'],
  ['Accept & schedule', 'The poster chooses someone, and both agree on a time.'],
  ['Start with a PIN', 'The job only goes active through MORT’s start flow — not a random button.'],
  ['Work & finish', 'Safety tools stay available; completion is confirmed where applicable.'],
  ['Completed', 'It joins both histories, reputation grows, and reviews can follow.'],
]

const pillars = [
  { icon: '🧭', title: 'Move', text: 'MORT is designed to connect teens with age-appropriate local work. Job discovery and publishing are currently closed.' },
  { icon: '🛡️', title: 'Trust', text: 'MORT is building account eligibility, job history and identity-verification controls. Identity-verification submissions are not currently available.' },
  { icon: '✦', title: 'Safety', text: 'The product includes reporting, blocking, check-ins, private-location controls and optional Guardian oversight. These tools do not guarantee safety or provide emergency response.' },
]

const roles = [
  { icon: '🔥', title: 'For teens', color: 'var(--primary)', items: ['Create an account and complete eligibility steps', 'Prepare to discover age-appropriate local work when the marketplace opens', 'Use safety tools and optional connected-Guardian oversight'], cta: 'Get started', href: '/signup' },
  { icon: '🧭', title: 'For adults', color: 'var(--accent-blue)', items: ['Adult verification is required before posting', 'Verification submissions are currently unavailable', 'Job posting stays disabled until verification is operational'], cta: 'Get started', href: '/signup' },
  { icon: '🛡️', title: 'For guardians', color: 'var(--muted2)', items: ['Connect with an invite code', 'See activity and safety information for linked teens', 'Require application approval where the job or Guardian settings enable it'], cta: 'Guardian information', href: '/safety' },
]

const safety = [
  { cls: 'card danger-card', tile: 'card-icon-tile', icon: '🚨', title: 'Safety pings', text: 'Teens can create an in-app safety ping for connected Guardians. MORT is not an emergency-response service; call 911 if someone is in immediate danger.' },
  { cls: 'card highlight', tile: 'card-icon-tile blue', icon: '✅', title: 'Safety check-ins', text: 'The app supports scheduled job check-ins and completion records. Guardian visibility depends on an active connection and the relevant access controls.' },
  { cls: 'card', tile: 'card-icon-tile', icon: '🛡️', title: 'Adult verification', text: 'Adult verification submissions are not currently available. Adults cannot post jobs until the verification workflow is operational and approval is recorded.' },
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
        <section className="mort-hero-section">
          <MortHero />
          <div className="mort-cta-row">
            <Link className="btn primary lg" href="/signup">Get MORT — it’s free</Link>
            <Link className="btn ghost lg" href="/#how">See how it works</Link>
          </div>
          <div className="mort-assur"><b>Pre-launch</b> · Marketplace closed · Adult verification unavailable · Payments disabled</div>
          <div className="mort-scrollhint">explore</div>
        </section>

        <section id="how" className="section container mort-narrow mort-center">
          <div className="kicker">The crossing</div>
          <h2>Every job is a short voyage.</h2>
          <p className="lead mort-lead-center">MORT is building a structured path from discovery and application through scheduling, safe job start and completion. The marketplace is not open yet.</p>
          <div className="card mort-crossing-wrap" style={{ marginTop: 32, textAlign: 'left' }}>
            <MortVoyage />
          </div>
          <div className="mort-steps" style={{ textAlign: 'left' }}>
            {crossing.map((s, i) => (
              <div className="mort-step" key={s[0]}>
                <div className="n">{i + 1}</div>
                <div><h4>{s[0]}</h4><p>{s[1]}</p></div>
              </div>
            ))}
          </div>
        </section>

        <section className="section container mort-center">
          <div className="kicker">Move · Trust · Safety</div>
          <h2>Not a gig app. Its own category.</h2>
          <p className="lead mort-lead-center">MORT is local opportunity infrastructure — account eligibility, job states, evidence and accountability designed around real nearby work.</p>
          <div className="grid three" style={{ marginTop: 32, textAlign: 'left' }}>
            {pillars.map(p => (
              <div className="card" key={p.title}>
                <div className="card-icon-tile">{p.icon}</div>
                <h3>{p.title}</h3>
                <p style={{ marginTop: 6 }}>{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="categories" className="section container mort-center">
          <div className="kicker">Future local work</div>
          <h2>Tutoring. Lawn care. Dog walking. Real jobs, not gig-app filler.</h2>
          <p className="lead mort-lead-center">These are examples of work MORT is designed to support. Job discovery and applications are not currently available.</p>
          <div className="grid four" style={{ marginTop: 32 }}>
            {FEATURED_CATEGORIES.map(c => (
              <CategoryTile key={c.category} category={c.category} label={c.label} count={counts[c.category] || 0}
                href="/signup" />
            ))}
          </div>
        </section>

        <section id="roles" className="section container mort-center">
          <div className="kicker">Who it’s for</div>
          <h2>Related experiences, tuned to each side.</h2>
          <div className="grid three" style={{ marginTop: 32, textAlign: 'left' }}>
            {roles.map(r => (
              <div className="card highlight" key={r.title}>
                <div style={{ fontSize: 30, marginBottom: 12 }}>{r.icon}</div>
                <h3 style={{ color: r.color }}>{r.title}</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {r.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13.5, color: 'var(--muted2)' }}>
                      <span style={{ color: r.color, fontSize: 12, marginTop: 3 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <Link href={r.href} className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>{r.cta}</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="section container mort-center">
          <div className="kicker">Safety, never premium</div>
          <h2>Built in from the very first screen.</h2>
          <p className="lead mort-lead-center">MORT can’t guarantee anyone’s safety and does not provide 24/7 monitoring or emergency response. Reporting and blocking tools are designed to be available without a paid plan.</p>
          <div className="grid three" style={{ marginTop: 32, textAlign: 'left' }}>
            {safety.map(s => (
              <div className={s.cls} key={s.title}>
                <div className={s.tile}>{s.icon}</div>
                <h3>{s.title}</h3>
                <p style={{ marginTop: 6 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section container mort-center" style={{ paddingBottom: 90 }}>
          <div className="card" style={{ maxWidth: 760, margin: '0 auto', padding: '56px 30px' }}>
            <div className="kicker" style={{ justifyContent: 'center' }}>Pre-launch</div>
            <h2>Earn nearby. Move smart.</h2>
            <p className="lead mort-lead-center" style={{ margin: '12px auto 28px' }}>Create an account to prepare for MORT. Account creation does not grant marketplace access; job discovery, publishing, identity verification and payments remain disabled.</p>
            <Link className="btn primary lg" href="/signup">Get MORT</Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link href="/" className="logo" style={{ marginBottom: 16 }}>
                <Logomark size={26} />
                <span>MORT</span>
              </Link>
              <p style={{ fontSize: 13, maxWidth: 260, marginTop: 12 }}>Local opportunity infrastructure for teenagers. Earn nearby. Move smart. Stay safe.</p>
            </div>
            <div>
              <h4 style={{ marginBottom: 12 }}>Product</h4>
              <div className="footer-links">
                <Link href="/#how">How it works</Link>
                <Link href="/#roles">For teens</Link>
                <Link href="/#roles">For adults</Link>
                <Link href="/safety">Safety</Link>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: 12 }}>Legal</h4>
              <div className="footer-links">
                <Link href="/legal/terms">Terms of service</Link>
                <Link href="/legal/privacy">Privacy policy</Link>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: 12 }}>Account</h4>
              <div className="footer-links">
                <Link href="/signup">Create account</Link>
                <Link href="/login">Sign in</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 MORT. Teen-safe local opportunity infrastructure.</span>
            <span>Not a payment processor. Compensation is arranged off-platform.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
