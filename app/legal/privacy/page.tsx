import { SiteHeader } from '@/components/site-header'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: 'var(--muted2)', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  )
}

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main className="section container" style={{ maxWidth: 780 }}>
        <div className="kicker">Legal — draft</div>
        <h1 style={{ marginBottom: 12 }}>Privacy Policy</h1>

        <div className="warning-box" style={{ marginBottom: 28 }}>
          <strong>⚠️ This is a draft, not a final legal document.</strong> MORT handles data belonging to minors and must complete a full legal and compliance review — including applicable child-privacy law — before public launch. This page does not claim COPPA or other regulatory compliance is complete.
        </div>

        <Section title="Account data">
          <p>When you create a MORT account we store your email address and authentication details (via Supabase Auth), your selected role (teen, adult/business, guardian, or admin), and account status (active/suspended).</p>
        </Section>

        <Section title="Profile data">
          <p>We store the profile information you provide: display name, username, city/state, date of birth (used to confirm teen age range), verification status, XP/level progress, and payment preference (informational only — see Terms).</p>
        </Section>

        <Section title="Job data">
          <p>We store jobs posted by adults/businesses (title, description, category, pay label, location text, status) and applications submitted by teens (status, notes).</p>
        </Section>

        <Section title="Messaging data">
          <p>Messages sent between a teen and adult who share a job application are stored, along with a basic automated &quot;scanner status&quot; used to flag messages that may indicate off-platform pressure or unsafe requests. Guardians and admins may be able to see message activity as part of MORT&apos;s safety model.</p>
        </Section>

        <Section title="Safety ping data">
          <p>When a teen sends a safety check-in (&quot;I&apos;m safe,&quot; &quot;I need help,&quot; or a custom note), we store the status, optional note, and timestamp. This data is visible to the teen&apos;s connected guardian(s) and to MORT admins.</p>
        </Section>

        <Section title="Proof upload data">
          <p>Photos, short videos, or notes a teen uploads as proof of completed work are stored in Supabase Storage and linked to the relevant application. Proof is visible to the teen, the adult who posted the job, and MORT admins — not to unrelated users.</p>
        </Section>

        <Section title="Guardian relationship data">
          <p>When a teen connects a guardian using an invite code, we store the connection and its status (invited/active). This lets a guardian view their connected teen&apos;s applications and safety activity as described in the Terms.</p>
        </Section>

        <Section title="Admin review data">
          <p>Business verification requests, reports, and support tickets are stored along with the review outcome and the admin who acted on them, for accountability and moderation history.</p>
        </Section>

        <Section title="Basic analytics">
          <p>We may use basic, aggregate usage data (e.g. which pages are visited) to improve MORT. This starter build does not include a dedicated third-party analytics or advertising integration.</p>
        </Section>

        <Section title="Data deletion & contact">
          <p>To request deletion of your account or data, contact MORT support through the in-app Support page. This starter build does not yet include a fully automated self-service deletion flow — treat this as a placeholder contact path pending a production data-deletion process.</p>
        </Section>

        <Section title="What we don't do">
          <p>MORT does not collect Social Security numbers, bank account numbers, or payment card numbers. MORT does not sell personal data to third parties.</p>
        </Section>
      </main>
    </>
  )
}
