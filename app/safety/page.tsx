import { SiteHeader } from '@/components/site-header'

export default function SafetyPage() {
  return (
    <>
      <SiteHeader />
      <main className="section container">
        <div className="kicker">Safety first</div>
        <h1 style={{ marginBottom: 12 }}>MORT Safety</h1>
        <p className="lead" style={{ marginBottom: 20 }}>
          MORT is built around teen safety at every step — before, during, and after a job.
        </p>

        <div className="emergency-disclaimer" style={{ marginBottom: 32, maxWidth: 720 }}>
          ⚠️ <strong>MORT is not a replacement for calling 911 or local emergency services.</strong> If you or someone else is in immediate danger, call emergency services first.
        </div>

        <div className="grid two">
          <div className="card">
            <h3>Marketplace rules</h3>
            <p>No off-platform payment pressure, private info requests, unsafe meetups, harassment, bullying, fake jobs, or adult-to-teen manipulation of any kind.</p>
          </div>
          <div className="card">
            <h3>Teen controls</h3>
            <p>Safety pings, one-tap reporting, Guardian Mode oversight, verified adults, visible job locations, proof-of-work uploads, and a dispute record for every job.</p>
          </div>
          <div className="card">
            <h3>Adult verification</h3>
            <p>Adults and businesses submit a verification request before they can post jobs. A human admin reviews and approves or rejects every request.</p>
          </div>
          <div className="card">
            <h3>Guardian oversight</h3>
            <p>Guardians can require approval before a teen&apos;s application goes to the job poster, and can see safety pings and job activity for connected teens at any time.</p>
          </div>
          <div className="card">
            <h3>Moderated messaging</h3>
            <p>Teens and adults can only message once there&apos;s a real job application between them — never random direct messages. Messages are scanned for common risk patterns.</p>
          </div>
          <div className="card danger-card">
            <h3>Legal &amp; safety limitations (please read)</h3>
            <p>MORT is an MVP built for teens 13+. It has not yet completed formal legal review, background-check integration, or a 24/7 human moderation team. Treat every job with the same caution you&apos;d use meeting anyone new — bring a friend, meet in public/visible locations, and tell a trusted adult where you&apos;re going.</p>
          </div>
        </div>
      </main>
    </>
  )
}
