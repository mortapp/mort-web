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
  { icon: '🧭', title: 'Move', text: 'Discover and complete real work nearby — yard work, pet care, moving help, event prep and other approved local jobs.' },
  { icon: '🛡️', title: 'Trust', text: 'Identities, reputation, history and verification give both sides a reason to rely on each other — no blank-slate strangers.' },
  { icon: '✦', title: 'Safety', text: 'Approximate location, private messaging, reporting, check-ins, an optional guardian, and PIN-based job start — never behind a paywall.' },
]

const roles = [
  { icon: '🔥', title: 'For teens', color: 'var(--primary)', items: ['Discover → apply → schedule → work → complete', 'Build a reputation that travels with you', 'Privacy-first location, in-app messaging'], cta: 'Start your hustle', href: '/signup' },
  { icon: '🧭', title: 'For adults', color: 'var(--accent-blue)', items: ['Post → review applicants → accept → confirm', 'Verified identities and real ratings', 'Responsible for lawful, age-appropriate work'], cta: 'Post a job', href: '/signup' },
  { icon: '🛡️', title: 'For guardians', color: 'var(--muted2)', items: ['Connect with an invite code', 'See applications and safety pings', 'Approve or pause any job'], cta: 'Protect your teen', href: '/signup' },
]

const safety = [
  { cls: 'card danger-card', tile: 'card-icon-tile', icon: '🚨', title: 'SOS', text: 'One tap sends an emergency ping to guardians and admins with your last known job location.' },
  { cls: 'card highlight', tile: 'card-icon-tile blue', icon: '✅', title: 'Safety check-ins', text: 'Teens check in when they arrive, start and finish. Guardians see every ping.' },
  { cls: 'card', tile: 'card-icon-tile', icon: '🛡️', title: 'Verified adults', text: 'Every adult is reviewed by admins before they can post jobs or contact teens.' },
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
        {/* Immersive hero — the voyage fills the screen */}
        <section className="mort-hero-section">
          <MortHero />
          <div className="mort-cta-row">
            <Link className="btn primary lg" href="/signup">Get MORT — it’s free</Link>
            <Link className="btn ghost lg" href="/#crossing">See how it works</Link>
          </div>
          <div className="mort-assur"><b>Free</b> for teens · <b>Guardian</b> controls · <b>Verified</b> adults only</div>
          <div className="mort-scrollhint">explore</div>
        </section>

        {/* The crossing — the job lifecycle as a short voyage */}
        <section id="crossing" className="section container mort-narrow mort-center">
          <div className="kicker">The crossing</div>
          <h2>Every job is a short voyage.</h2>
          <p className="lead mort-lead-center">From the moment a teen applies to the moment the work is done, MORT tracks exactly where things stand — and who acts next.</p>
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

        {/* Move · Trust · Safety */}
        <section className="section container mort-center">
          <div className="kicker">Move · Trust · Safety</div>
          <h2>Not a gig app. Its own category.</h2>
          <p className="lead mort-lead-center">MORT is local opportunity infrastructure — identity, job states, evidence and accountability wrapped around real nearby work.</p>
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

        {/* Real local work — live categories */}
        <section id="categories" className="section container mort-center">
          <div className="kicker">Real local work</div>
          <h2>Tutoring. Lawn care. Dog walking. Real jobs, not gig-app filler.</h2>
          <p className="lead mort-lead-center">Every job on MORT is something a teen can actually do nearby, for someone in their community.</p>
          <div className="grid four" style={{ marginTop: 32 }}>
            {FEATURED_CATEGORIES.map(c => (
              <CategoryTile key={c.category} category={c.category} label={c.label} count={counts[c.category] || 0}
                href={`/signup?next=${encodeURIComponent(`/app/teen/jobs?category=${c.category}`)}`} />
            ))}
          </div>
        </section>

        {/* Roles */}
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

        {/* Safety — never premium */}
        <section className="section container mort-center">
          <div className="kicker">Safety, never premium</div>
          <h2>Built in from the very first screen.</h2>
          <p className="lead mort-lead-center">MORT can’t guarantee anyone’s safety and doesn’t claim to read every message — but report, block and the Safety Center are free for everyone, always.</p>
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

        {/* Final CTA */}
        <section className="section container mort-center" style={{ paddingBottom: 90 }}>
          <div className="card" style={{ maxWidth: 760, margin: '0 auto', padding: '56px 30px' }}>
            <div className="kicker" style={{ justifyContent: 'center' }}>Start the crossing</div>
            <h2>Earn nearby. Move smart.</h2>
            <p className="lead mort-lead-center" style={{ margin: '12px auto 28px' }}>Create an account in under a minute. Safety tools are on from the very first screen.</p>
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
                <Link href="/#crossing">How it works</Link>
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
                <Link href="/signup?next=%2Fapp%2Fteen%2Fjobs">Browse jobs</Link>
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
