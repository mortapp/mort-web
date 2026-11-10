import Link from 'next/link'
import '../mort-public-home.css'
import { Logomark } from '@/components/logomark'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SafetyPage() {
  return (
    <div className="mort-public">
      <header className="mp-nav">
        <div className="mp-shell mp-nav-inner">
          <Link href="/" className="mp-brand"><Logomark size={30} /><span>MORT</span></Link>
          <nav aria-label="Safety page navigation">
            <Link href="/#how">How it works</Link><Link href="/#work">Work</Link><Link href="/legal/terms">Legal</Link>
          </nav>
          <div className="mp-nav-actions">
            <ThemeToggle />
            <Link href="/signup" className="mp-button mp-button-solid">Create account <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </header>

      <main className="mp-section" style={{ borderTop: 0 }}>
        <div className="mp-shell">
          <p className="mp-eyebrow">Safety first</p>
          <h1 style={{ fontSize: 'clamp(38px, 5vw, 64px)', lineHeight: 1.04, letterSpacing: '-0.03em', fontWeight: 800, margin: '0 0 16px' }}>MORT Safety</h1>
          <p style={{ fontSize: 'clamp(16px, 1.6vw, 19px)', lineHeight: 1.6, color: 'var(--muted2)', maxWidth: 640, margin: '0 0 28px' }}>
            MORT builds safety controls into teen and adult accounts. These controls are not a substitute for human supervision or emergency services.
          </p>

          <div className="mp-emergency" role="note">
            <span aria-hidden="true">⚠</span>
            <p><strong>MORT is not a replacement for calling 911 or local emergency services.</strong> If you or someone else is in immediate danger, call emergency services first. MORT does not provide 24/7 emergency monitoring or dispatch.</p>
          </div>

          <div className="mp-safety-cards">
            <div className="mp-safety-card">
              <h3>Eligibility</h3>
              <p>Job discovery, applications, and job publishing are available to eligible accounts. Creating an account does not by itself approve you to apply for or post jobs; eligibility, age and role checks, and Guardian approval requirements still apply.</p>
            </div>
            <div className="mp-safety-card">
              <h3>Teen controls</h3>
              <p>The product includes reporting, blocking, safety pings, job check-in workflows and private-location controls. Guardian visibility depends on an active Guardian connection and the relevant access permissions.</p>
            </div>
            <div className="mp-safety-card">
              <h3>Adult verification</h3>
              <p>Adults must complete verification before they can post jobs or contact teens through marketplace workflows. MORT does not treat an adult as verified merely because an account was created.</p>
            </div>
            <div className="mp-safety-card">
              <h3>Guardian oversight</h3>
              <p>Guardian participation is optional where the product and applicable requirements allow it. A connected Guardian can receive safety information for the linked teen and can require application approval when the job or Guardian settings enable that requirement. Guardian access is limited to the linked teen.</p>
            </div>
            <div className="mp-safety-card">
              <h3>Messaging and reports</h3>
              <p>Messaging is restricted to permitted job-related conversations and uses server-side safety controls. Users can block and report concerns. MORT does not claim that every message is read by a person or that every report receives an immediate response.</p>
            </div>
            <div className="mp-safety-card mp-safety-card-critical">
              <h3>Legal & safety limitations (please read)</h3>
              <p>MORT&rsquo;s published Safety Rules describe safeguards and boundaries for Tasks, including Guardian approval for each Task at a private residence and a second adult other than the Poster being present throughout work inside a residence. These rules reduce risk but do not guarantee safety. MORT is not an emergency-response service; call 911 for immediate danger.</p>
              <p><Link href="/legal/safety">Read the published Safety Rules <span aria-hidden="true">↗</span></Link></p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mp-footer">
        <div className="mp-shell">
          <div className="mp-footer-main">
            <Link href="/" className="mp-brand"><Logomark size={28} /><span>MORT</span></Link>
            <p>Safety is a foundation of MORT, not a feature.</p>
            <div className="mp-footer-links"><Link href="/">Home</Link><Link href="/legal/terms">Terms</Link><Link href="/legal/privacy">Privacy</Link></div>
          </div>
          <div className="mp-footer-bottom"><span>© 2026 MORT. All rights reserved.</span><span>Availability and features may vary by location and account status.</span></div>
        </div>
      </footer>
    </div>
  )
}
