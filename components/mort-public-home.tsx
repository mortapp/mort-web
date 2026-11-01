'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Logomark } from '@/components/logomark'

const categories = [
  ['Tutoring', '01', 'Academic support'],
  ['Lawn care', '02', 'Yards and outdoor work'],
  ['Dog walking', '03', 'Pet care'],
  ['Errands', '04', 'Helpful local tasks'],
  ['Car washing', '05', 'Simple neighborhood services'],
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
            <Link href="#how">How it works</Link><Link href="#opportunities">Opportunities</Link><Link href="/safety">Safety</Link>
          </nav>
          <div className="mp-nav-actions">
            <Link href={isSignedIn ? '/app' : '/login'} className="mp-signin">{isSignedIn ? 'Dashboard' : 'Sign in'}</Link>
            <Link href="/signup" className="mp-button mp-button-dark">Get started <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mp-hero">
          <div className="mp-shell mp-hero-grid">
            <div className="mp-hero-copy">
              <div className="mp-eyebrow"><span /> LOCAL WORK. REAL OPPORTUNITY.</div>
              <h1>Make your<br /><span>next move.</span></h1>
              <p className="mp-hero-lead">A better way for teens to find paid work nearby — and for local people to find reliable help.</p>
              <div className="mp-hero-actions">
                <Link href="/signup" className="mp-button mp-button-blue">Get started <span>↗</span></Link>
                <Link href="#how" className="mp-text-link">See how MORT works <span>↓</span></Link>
              </div>
              <div className="mp-proof"><span className="mp-proof-mark">✓</span><span>Designed for ages 13–17</span><i /><span>Safety built into the experience</span></div>
            </div>
            <div className="mp-hero-art" aria-label="Illustration of a local job opportunity card">
              <div className="mp-orbit mp-orbit-one" /><div className="mp-orbit mp-orbit-two" />
              <div className="mp-art-glow" />
              <div className="mp-floating-label mp-label-top"><span className="mp-label-dot" /> LOCAL OPPORTUNITY</div>
              <div className="mp-job-preview">
                <div className="mp-job-top"><span className="mp-job-icon">✳</span><span className="mp-job-status">Example preview</span></div>
                <div className="mp-job-category">YARD WORK</div>
                <h3>Help tidy up a backyard</h3>
                <p>A neighborhood task with clear expectations and agreed timing.</p>
                <div className="mp-job-meta"><span>⌖ Nearby area</span><span>◷ Flexible</span></div>
                <div className="mp-job-divider" />
                <div className="mp-job-bottom"><span>Clear details. Safer connections.</span><span className="mp-arrow">↗</span></div>
              </div>
              <div className="mp-floating-label mp-label-bottom"><span className="mp-shield">✓</span> SAFETY COMES FIRST</div>
            </div>
          </div>
          <div className="mp-shell mp-hero-foot"><span>01 / A NEW KIND OF LOCAL MARKETPLACE</span><span>BUILT FOR THE NEXT GENERATION <b>↘</b></span></div>
        </section>

        <section className="mp-intro mp-section" id="how">
          <div className="mp-shell">
            <div className="mp-section-head"><div><div className="mp-eyebrow">THE IDEA</div><h2>Opportunity should<br />be <span>closer to home.</span></h2></div><p>Finding a first job shouldn't mean sorting through random posts, sharing too much personal information, or figuring everything out alone. MORT gives local work a clearer path.</p></div>
            <div className="mp-steps">
              {[
                ['01', 'Discover', 'Explore approved local opportunities with useful details and privacy in mind.'],
                ['02', 'Connect', 'Apply through MORT. The person posting the job reviews applicants and makes the choice.'],
                ['03', 'Get it done', 'Agree on the details, follow the job steps, and keep safety tools close.'],
              ].map(([n, title, body]) => <article className="mp-step" key={n}><span className="mp-step-number">{n}</span><div><h3>{title}</h3><p>{body}</p></div><span className="mp-step-arrow">↗</span></article>)}
            </div>
          </div>
        </section>

        <section className="mp-opportunities mp-section" id="opportunities">
          <div className="mp-shell">
            <div className="mp-section-topline"><div className="mp-eyebrow">WORK THAT MATTERS</div><span>LOCAL SKILLS. REAL EXPERIENCE.</span></div>
            <div className="mp-opportunity-heading"><h2>Start with what<br /><span>you can do.</span></h2><p>From helping a neighbor to sharing a skill, MORT focuses on practical, age-appropriate work that makes a difference close to home.</p></div>
            <div className="mp-category-grid">{categories.map(([name, n, desc]) => <Link href={`/signup?next=${encodeURIComponent('/app/teen/jobs')}`} className="mp-category" key={n}><span className="mp-category-number">{n}</span><span className="mp-category-icon">{['⌁','✳','♡','↗','◉','▤'][Number(n)-1]}</span><h3>{name}</h3><p>{desc}</p><span className="mp-category-arrow">↗</span></Link>)}</div>
            <p className="mp-category-note">Examples of work categories. Availability depends on approved listings in your area.</p>
          </div>
        </section>

        <section className="mp-audience mp-section">
          <div className="mp-shell">
            <div className="mp-audience-heading"><div className="mp-eyebrow">ONE COMMUNITY, CLEAR ROLES</div><h2>Made for both sides<br />of the <span>neighborhood.</span></h2></div>
            <div className="mp-audience-switch" role="group" aria-label="Choose who MORT is for"><button type="button" aria-pressed={audience === 'teen'} className={audience === 'teen' ? 'active' : ''} onClick={() => setAudience('teen')}>I'm a teen</button><button type="button" aria-pressed={audience === 'adult'} className={audience === 'adult' ? 'active' : ''} onClick={() => setAudience('adult')}>I'm hiring</button></div>
            <div className="mp-audience-card">
              <div className="mp-audience-card-copy"><span className="mp-audience-kicker">{audience === 'teen' ? 'FOR TEENS · AGES 13–17' : 'FOR ADULTS & LOCAL BUSINESSES'}</span><h3>{audience === 'teen' ? 'Turn your time into something.' : 'Find a helping hand nearby.'}</h3><p>{audience === 'teen' ? 'Find work that fits your skills, apply with confidence, and build a track record as you go. Your profile and job activity stay yours.' : 'Post a clear, age-appropriate task, review applications, and coordinate with teens through a structured process.'}</p><Link href="/signup" className="mp-button mp-button-dark">{audience === 'teen' ? 'Create a teen account' : 'Create an adult account'} <span>↗</span></Link></div>
              <div className="mp-audience-card-side"><div className="mp-side-number">{audience === 'teen' ? '13—17' : 'LOCAL'}</div><p>{audience === 'teen' ? 'A space designed around the needs and safety of young people.' : 'A practical way to connect with local talent and get everyday work done.'}</p><div className="mp-side-rule" /><span>MOVE SMART. STAY ACCOUNTABLE.</span></div>
            </div>
          </div>
        </section>

        <section className="mp-safety mp-section">
          <div className="mp-shell mp-safety-grid"><div><div className="mp-eyebrow">SAFETY IS THE FOUNDATION</div><h2>Built with<br /><span>care in mind.</span></h2><p>MORT is designed with privacy, accountability, and clear boundaries at its core. No platform can guarantee safety, but the right tools and rules can make a meaningful difference.</p><Link href="/safety" className="mp-text-link">Explore the safety approach <span>↗</span></Link></div>
            <div className="mp-safety-list"><article><span>01</span><div><h3>Privacy-aware discovery</h3><p>Keep precise personal location details out of public listings.</p></div><b>↗</b></article><article><span>02</span><div><h3>Clear account roles</h3><p>Separate experiences for teens, adults, guardians, and admins.</p></div><b>↗</b></article><article><span>03</span><div><h3>Tools to speak up</h3><p>Reporting, blocking, and safety guidance are part of the product.</p></div><b>↗</b></article></div>
          </div>
        </section>
        <section className="mp-final"><div className="mp-shell"><div className="mp-final-panel"><div className="mp-eyebrow">YOUR NEXT MOVE STARTS HERE</div><h2>Earn nearby.<br /><span>Move smart.</span></h2><Link href="/signup" className="mp-button mp-button-light">Get started <span>↗</span></Link><div className="mp-final-mark">MORT®</div></div></div></section>
      </main>
      <footer className="mp-footer"><div className="mp-shell"><div className="mp-footer-main"><Link href="/" className="mp-brand"><Logomark size={28} /><span>MORT</span></Link><p>Local opportunity, with a little more thought behind it.</p><div className="mp-footer-links"><Link href="#how">How it works</Link><Link href="/safety">Safety</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/login">Sign in</Link></div></div><div className="mp-footer-bottom"><span>© 2026 MORT. All rights reserved.</span><span>Availability and features may vary by location and account status.</span></div></div></footer>
    </div>
  )
}
