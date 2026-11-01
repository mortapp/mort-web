import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { Logomark } from '@/components/logomark'
import { createClient } from '@/lib/supabase/server'

const steps = [
  ['01', 'Discover', 'Find local listings with clear expectations and privacy-safe location details.'],
  ['02', 'Apply', 'Send an application tied to a real job. The poster reviews it and chooses what happens next.'],
  ['03', 'Coordinate', 'Keep job conversations and status updates connected to the work.'],
  ['04', 'Complete', 'Follow the supported job process and keep a clear record of what happened.'],
]

const categories = ['Yard work', 'Pet care', 'Tutoring', 'Household help', 'Moving help', 'Tech help']

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <SiteHeader isSignedIn={!!user} />
      <main className="public-home">
        <section className="public-hero">
          <div className="container public-hero-grid">
            <div className="public-hero-copy">
              <span className="public-eyebrow"><span /> LOCAL WORK, BUILT WITH CARE</span>
              <h1>Good work starts <span>close to home.</span></h1>
              <p>MORT brings teens, adults, and local businesses into one clearer way to discover work, coordinate jobs, and build trust over time.</p>
              <div className="public-hero-actions">
                <Link href={user ? '/app' : '/signup'} className="btn primary lg">{user ? 'Open MORT' : 'Get started'}</Link>
                <Link href="/safety" className="btn lg">How safety works</Link>
              </div>
              <div className="public-proofline"><span>13+ community</span><i /> <span>Optional Guardian connections</span><i /> <span>Privacy-aware by design</span></div>
            </div>
            <div className="public-preview" aria-label="Illustrative MORT job card">
              <div className="public-preview-top"><span>LOCAL WORK</span><span className="preview-live-dot" /> <span>PRODUCT PREVIEW</span></div>
              <div className="preview-distance">NEARBY · GENERAL AREA ONLY</div>
              <div className="preview-person"><div className="preview-avatar">M</div><div><strong>Local community listing</strong><small>Poster details shown in the job flow</small></div></div>
              <div className="preview-category">YARD WORK</div>
              <h2>Help with a front yard</h2>
              <p>Clear the leaves, tidy the garden beds, and leave the space looking fresh.</p>
              <div className="preview-meta"><strong>$25</strong><span>·</span><span>Approx. 45 min</span><span>·</span><span>Saturday</span></div>
              <div className="preview-actions"><span className="preview-save">♡</span><span className="preview-apply">View job</span></div>
              <div className="preview-footnote">Illustrative example · Not a live listing</div>
            </div>
          </div>
          <div className="public-hero-bottom container"><span>ONE PRODUCT</span><span>SHARED JOB LIFECYCLE</span><span>ROLE-AWARE PERMISSIONS</span><span>SAFETY FIRST</span></div>
        </section>

        <section className="public-section container" id="how-it-works">
          <div className="public-section-heading">
            <span className="public-eyebrow">A CLEARER WAY TO WORK</span>
            <h2>From first look to finished job.</h2>
            <p>Every step has a clear status, a next action, and a record that stays connected to the job.</p>
          </div>
          <div className="public-steps">
            {steps.map(([number, title, description]) => <article className="public-step" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
          </div>
        </section>

        <section className="public-section public-section-soft">
          <div className="container public-audience-grid">
            <div className="public-section-heading"><span className="public-eyebrow">ONE MORT, DIFFERENT PERMISSIONS</span><h2>Designed around the people doing the work.</h2><p>Teen, adult, business, and Guardian experiences share one product language. What each person can see and do depends on their role and the permissions they have.</p></div>
            <div className="public-audience-cards">
              <article><span className="audience-number">01 / TEENS</span><h3>Find your next opportunity.</h3><p>Explore local work, apply to listings, follow your applications, and keep job conversations connected to the work.</p><Link href="/signup" className="text-link">Create a teen account</Link></article>
              <article><span className="audience-number">02 / ADULTS & BUSINESSES</span><h3>Organize local help.</h3><p>Prepare clear job listings, review applications, and manage the work you have posted. Publishing is subject to verification and production availability.</p><Link href="/signup" className="text-link">Create an adult account</Link></article>
              <article><span className="audience-number">03 / GUARDIANS</span><h3>Stay connected by consent.</h3><p>Guardian connections are optional. A connection becomes active only through the required invitation and mutual consent.</p><Link href="/signup" className="text-link">Learn about Guardian Mode</Link></article>
            </div>
          </div>
        </section>

        <section className="public-section container">
          <div className="public-section-heading"><span className="public-eyebrow">LOCAL MEANS LOCAL</span><h2>Real-world work. Clear expectations.</h2><p>Start with practical services people already need in their communities.</p></div>
          <div className="public-category-grid">{categories.map((category, index) => <div className="public-category" key={category}><span>0{index + 1}</span><strong>{category}</strong><span aria-hidden="true">↗</span></div>)}</div>
        </section>

        <section className="public-safety">
          <div className="container public-safety-grid">
            <div><span className="public-eyebrow">SAFETY IS INFRASTRUCTURE</span><h2>Trust should be built into the way work happens.</h2></div>
            <div><p>MORT is designed around role-aware access, privacy-conscious location details, job-based conversations, reporting, blocking, and optional Guardian connections.</p><p className="public-safety-note">Safety tools have defined limits. MORT is not an emergency-response service, does not provide live emergency dispatch, and does not guarantee anyone’s safety. Payment processing and payouts are not currently enabled.</p><Link href="/safety" className="btn">Explore safety & privacy</Link></div>
          </div>
        </section>

        <section className="public-final container"><span className="public-eyebrow">MOVE WITH PURPOSE</span><h2>Make the next step a good one.</h2><p>One account. A clearer path from opportunity to completed work.</p><Link href={user ? '/app' : '/signup'} className="btn primary lg">{user ? 'Go to MORT' : 'Create your account'}</Link></section>
      </main>

      <footer className="public-footer"><div className="container public-footer-main"><Link href="/" className="logo"><Logomark size={28}/><span>MORT</span></Link><div className="public-footer-links"><Link href="/safety">Safety</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link><Link href="/login">Sign in</Link></div></div><div className="container public-footer-bottom"><span>© 2026 MORT</span><span>Local opportunity, built with care.</span></div></footer>
    </>
  )
}
