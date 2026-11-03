import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function SafetyPage() {
  return (
    <>
      <SiteHeader />
      <main className="section container">
        <div className="kicker">Safety first</div>
        <h1 style={{ marginBottom: 12 }}>MORT Safety</h1>
        <p className="lead" style={{ marginBottom: 20 }}>
          MORT is building safety controls for teen and adult accounts. The marketplace is currently closed, adult verification submissions are unavailable, and these controls are not a substitute for human supervision or emergency services.
        </p>

        <div className="emergency-disclaimer" style={{ marginBottom: 32, maxWidth: 720 }}>
          ⚠️ <strong>MORT is not a replacement for calling 911 or local emergency services.</strong> If you or someone else is in immediate danger, call emergency services first. MORT does not provide 24/7 emergency monitoring or dispatch.
        </div>

        <div className="grid two">
          <div className="card">
            <h3>Marketplace status</h3>
            <p>Job discovery, applications, adult job publishing, identity-verification submissions, real document collection and payments are currently disabled. Do not treat account creation as approval to use the marketplace.</p>
          </div>
          <div className="card">
            <h3>Teen controls</h3>
            <p>The product includes reporting, blocking, safety pings, job check-in workflows and private-location controls. Guardian visibility depends on an active Guardian connection and the relevant access permissions.</p>
          </div>
          <div className="card">
            <h3>Adult verification</h3>
            <p>Adult verification submissions are currently unavailable. Adults cannot post jobs or contact teens through marketplace workflows until a real verification process is operational and approval is recorded. MORT does not claim an adult is verified merely because an account was created.</p>
          </div>
          <div className="card">
            <h3>Guardian oversight</h3>
            <p>Guardian participation is optional where the product and applicable requirements allow it. A connected Guardian can receive safety information for the linked teen and can require application approval when the job or Guardian settings enable that requirement. Guardian access is limited to the linked teen.</p>
          </div>
          <div className="card">
            <h3>Messaging and reports</h3>
            <p>Messaging is restricted to permitted job-related conversations and uses server-side safety controls. Users can block and report concerns. MORT does not claim that every message is read by a person or that every report receives an immediate response.</p>
          </div>
          <div className="card danger-card">
            <h3>Legal &amp; safety limitations (please read)</h3>
            <p>MORT’s published Safety Rules describe safeguards and boundaries for Tasks, including Guardian approval for each Task at a private residence and a second adult other than the Poster being present throughout work inside a residence. These rules reduce risk but do not guarantee safety. MORT is not an emergency-response service; call 911 for immediate danger.</p>
            <p><Link href="/legal/safety">Read the published Safety Rules</Link></p>
          </div>
        </div>
      </main>
    </>
  )
}
