'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Logomark } from '@/components/logomark'
import { ThemeToggle } from '@/components/theme-toggle'

const categories = [
  ['Tutoring', '01', 'Help with schoolwork'],
  ['Lawn care', '02', 'Mowing and yard work'],
  ['Dog walking', '03', 'Pet care nearby'],
  ['Errands', '04', 'Everyday helpful tasks'],
  ['Car washing', '05', 'Neighborhood car care'],
  ['Moving help', '06', 'Age-appropriate assistance'],
]

export function MortPublicHome({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const [audience, setAudience] = useState<'teen' | 'adult'>('teen')
  return (
    <div className="mort-public">
      <header className="mp-nav">
        <div className="mp-shell mp-nav-inner">
          <Link href="/" className="mp-brand"><Logomark size={30} /><span>MORT</span></Link>
          <nav aria-label="Main navigation">
            <Link href="#how">How it works</Link><Link href="#work">Work</Link><Link href="/safety">Safety</Link>
          </nav>
          <div className="mp-nav-actions">
            <ThemeToggle />
            <Link href={isSignedIn ? '/app' : '/login'} className="mp-signin">{isSignedIn ? 'Dashboard' : 'Sign in'}</Link>
            <Link href="/signup" className="mp-button mp-button-solid">Create account <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </header>

      <main>
        <div className="mp-launch-banner" role="status"><div className="mp-shell"><strong>Pre-launch</strong><span>The marketplace is not open. Job discovery, job publishing, verification submissions, and payments are disabled.</span></div></div>
        <section className="mp-hero">
          <div className="mp-shell">
            <p className="mp-eyebrow"><span aria-hidden="true" /> Local work. Real opportunity.</p>
            <h1>Make your<br /><span>next move.</span></h1>
            <p className="mp-hero-lead">MORT is preparing a safer way for teens to find age-appropriate local work — and for neighbors to hire them. Join now and be ready when the marketplace opens.</p>
            <div className="mp-hero-actions">
              <Link href="/signup" className="mp-button mp-button-solid">Create account <span aria-hidden="true">↗</span></Link>
              <Link href="#how" className="mp-text-link">See how MORT works <span aria-hidden="true">↓</span></Link>
            </div>
            <div className="mp-proof"><span className="mp-proof-mark" aria-hidden="true">✓</span><span>Designed for ages 13–17</span><i aria-hidden="true" /><span>Safety built into the experience</span></div>
          </div>
        </section>

        <section className="mp-intro mp-section" id="how">
          <div className="mp-shell">
            <div className="mp-section-head">
              <div><p className="mp-eyebrow">The loop</p><h2>From first look<br />to <span>first payment.</span></h2></div>
              <p>One clear path, built for real neighborhood work.</p>
            </div>
            <div className="mp-steps">
              {[
                ['01', 'See the work', 'When the marketplace opens, browse approved local jobs with clear details and privacy in mind.'],
                ['02', 'Apply in minutes', 'Send a short, honest application. The person posting the job reviews and chooses.'],
                ['03', 'Do it, get paid', 'Agree on the details, follow the job steps, keep safety tools close, and build your reputation.'],
              ].map(([n, title, body]) => <article className="mp-step" key={n}><span className="mp-step-number">{n}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="mp-opportunities mp-section" id="work">
          <div className="mp-shell">
            <div className="mp-section-topline"><p className="mp-eyebrow">Work that matters</p><span>Local skills. Real experience.</span></div>
            <div className="mp-section-head mp-opportunity-heading"><div><h2>Start with what<br /><span>you can do.</span></h2></div><p>From helping a neighbor to sharing a skill, MORT focuses on practical, age-appropriate work close to home.</p></div>
            <div className="mp-category-grid">{categories.map(([name, n, desc]) => <Link href={`/signup?next=${encodeURIComponent('/app/teen/jobs')}`} className="mp-category" key={n}><span className="mp-category-number">{n}</span><span className="mp-category-icon" aria-hidden="true">{['✦','✳','♡','↗','◉','▤'][Number(n)-1]}</span><h3>{name}</h3><p>{desc}</p><span className="mp-category-arrow" aria-hidden="true">↗</span></Link>)}</div>
            <p className="mp-category-note">Examples only. Job discovery and applications are not currently available.</p>
          </div>
        </section>

        <section className="mp-audience mp-section">
          <div className="mp-shell">
            <div className="mp-section-head"><div><p className="mp-eyebrow">One community, clear roles</p><h2>Made for both sides<br />of the <span>neighborhood.</span></h2></div><p>Pick your side of the street.</p></div>
            <div className="mp-audience-switch" role="group" aria-label="Choose who MORT is for"><button type="button" aria-pressed={audience === 'teen'} className={audience === 'teen' ? 'active' : ''} onClick={() => setAudience('teen')}>I&rsquo;m a teen</button><button type="button" aria-pressed={audience === 'adult'} className={audience === 'adult' ? 'active' : ''} onClick={() => setAudience('adult')}>I&rsquo;m hiring</button></div>
            <div className="mp-audience-card">
              <div className="mp-audience-card-copy"><span className="mp-audience-kicker">{audience === 'teen' ? 'For teens · ages 13–17' : 'For adults & local businesses'}</span><h3>{audience === 'teen' ? 'Turn your time into something.' : 'Find a helping hand nearby.'}</h3><p>{audience === 'teen' ? 'Get ready for real, age-appropriate work in your neighborhood. Discovery and applications open at launch.' : 'Post jobs for verified local teens once adult verification is live. Job posting is disabled until that process is operational.'}</p><Link href="/signup" className="mp-button mp-button-solid">{audience === 'teen' ? 'Create a teen account' : 'Create an adult account'} <span aria-hidden="true">↗</span></Link></div>
              <div className="mp-audience-card-side"><div className="mp-side-number">{audience === 'teen' ? '13—17' : 'LOCAL'}</div><p>{audience === 'teen' ? 'A space designed around the needs and safety of young people.' : 'A practical way to connect with local talent and get everyday work done.'}</p><div className="mp-side-rule" /><span>Move smart. Stay accountable.</span></div>
            </div>
          </div>
        </section>

        <section className="mp-safety mp-section">
          <div className="mp-shell mp-safety-grid">
            <div>
              <p className="mp-eyebrow">Safety is the foundation</p>
              <h2>Built with<br /><span>care in mind.</span></h2>
              <p>MORT is designed with privacy, accountability, and clear boundaries at its core. No platform can guarantee safety, but the right tools and rules make a real difference.</p>
              <Link href="/safety" className="mp-text-link">Explore the safety approach <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="mp-safety-list">
              <article><span>01</span><div><h3>Privacy-aware discovery</h3><p>Keep precise personal location details out of public listings.</p></div></article>
              <article><span>02</span><div><h3>Clear account roles</h3><p>Separate experiences for teens, adults, guardians, and admins.</p></div></article>
              <article><span>03</span><div><h3>Tools to speak up</h3><p>Reporting, blocking, and safety guidance are part of the product.</p></div></article>
            </div>
          </div>
        </section>

        <section className="mp-final">
          <div className="mp-shell">
            <div className="mp-final-panel">
              <p className="mp-eyebrow mp-final-eyebrow">MORT is preparing to launch</p>
              <h2>Earn nearby.<br /><span>Move smart.</span></h2>
              <Link href="/signup" className="mp-button mp-button-invert">Get started <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mp-footer">
        <div className="mp-shell">
          <div className="mp-footer-main">
            <Link href="/" className="mp-brand"><Logomark size={28} /><span>MORT</span></Link>
            <p>Local opportunity, with a little more thought behind it.</p>
            <div className="mp-footer-links"><Link href="#how">How it works</Link><Link href="/safety">Safety</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/login">Sign in</Link></div>
          </div>
          <div className="mp-footer-bottom"><span>© 2026 MORT. All rights reserved.</span><span>Availability and features may vary by location and account status.</span></div>
        </div>
      </footer>
    </div>
  )
}
