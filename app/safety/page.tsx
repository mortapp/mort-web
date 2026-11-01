import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'

export default function SafetyPage() {
  return (
    <>
      <SiteHeader />
      <main className="section container public-safety-page">
        <div className="kicker">Safety, privacy & product limits</div>
        <h1 style={{ marginBottom: 12 }}>Safety is part of the product.</h1>
        <p className="lead" style={{ marginBottom: 20, maxWidth: 760 }}>
          MORT is designed around teen-safe local work, clear role permissions, privacy-conscious location details, and reporting. These controls reduce risk; they do not guarantee anyone&apos;s safety.
        </p>

        <div className="emergency-disclaimer" style={{ marginBottom: 32, maxWidth: 820 }}>
          <strong>If you or someone else may be in immediate danger, call 911 or your local emergency service first.</strong> MORT is not an emergency-response service. An in-app help request does not contact emergency services or share live location.
        </div>

        <section className="card safety-current-status" style={{ marginBottom: 24 }}>
          <span className="small">CURRENT PRODUCTION STATUS</span>
          <h2>Some safety-dependent features are not available yet.</h2>
          <p>New job publishing, public marketplace discovery, payment processing, payouts, and real identity-document submissions are currently disabled. The production identity-verification provider is not configured. Do not upload identity documents or payment credentials to MORT.</p>
          <p>These controls remain closed until the required production safeguards and operational workflows have been verified.</p>
        </section>

        <div className="grid two">
          <div className="card">
            <h3>Account eligibility & verification</h3>
            <p>Production onboarding checks date of birth and requires an approved school email for teen accounts. Independent age verification and adult identity verification are not currently available. A profile status alone is not proof that a person has passed independent identity or background screening.</p>
          </div>
          <div className="card">
            <h3>Guardian connections</h3>
            <p>Guardian connections require an invitation and mutual consent before they become active. Connected Guardians can see supported application and help-request updates. The website does not currently provide Guardian application approval, rejection, or account-pause controls.</p>
          </div>
          <div className="card">
            <h3>Location privacy</h3>
            <p>Job discovery is designed to show general location information, not a teen&apos;s or poster&apos;s exact home address. The production job-save workflow does not write an exact address. Do not put street addresses, unit numbers, ZIP codes, or coordinates in public job descriptions.</p>
          </div>
          <div className="card">
            <h3>Messaging & reporting</h3>
            <p>Available conversations are tied to job activity and use production message-safety controls. Users can submit reports about supported jobs, messages, and accounts. Reports are not an emergency dispatch channel, and support-ticket inboxes are not yet available.</p>
          </div>
          <div className="card">
            <h3>Residential work rules</h3>
            <p>The published MORT Safety Rules require Guardian approval for a specific Task at a private residence. For work inside a residence, a second adult other than the Poster must be present and available throughout. The current website does not yet provide a verified per-Task Guardian approval workflow. The marketplace remains closed.</p>
            <p><Link href="/legal/safety">Read the published Safety Rules</Link></p>
          </div>
          <div className="card">
            <h3>Payments & payouts</h3>
            <p>MORT does not currently process, hold, fund, transfer, guarantee, or pay out job compensation. A listed amount or completed assignment is not proof that anyone has been paid. Do not enter bank details, card numbers, or payout credentials on this website.</p>
          </div>
        </div>

        <section className="card" style={{ marginTop: 24 }}>
          <h3>What to do if something feels wrong</h3>
          <ol style={{ paddingLeft: 20, marginTop: 12, display: 'grid', gap: 8 }}>
            <li>Stop the Task or conversation if you feel unsafe.</li>
            <li>Move to a safer public place if possible and contact a trusted adult or Guardian.</li>
            <li>For immediate danger, call emergency services. Do not wait for MORT.</li>
            <li>When safe, use the in-app Report function and preserve relevant evidence privately.</li>
          </ol>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            <Link href="/legal/safety" className="btn">Read Safety Rules</Link>
            <Link href="/legal/privacy" className="btn">Read Privacy Policy</Link>
            <Link href="/signup" className="btn primary">Create an account</Link>
          </div>
        </section>
      </main>
    </>
  )
}
