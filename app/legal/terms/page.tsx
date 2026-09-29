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

export default function Terms() {
  return (
    <>
      <SiteHeader />
      <main className="section container" style={{ maxWidth: 780 }}>
        <div className="kicker">Legal — draft</div>
        <h1 style={{ marginBottom: 12 }}>Terms of Service</h1>

        <div className="warning-box" style={{ marginBottom: 28 }}>
          <strong>⚠️ This is a draft, not final legal copy.</strong> It has not been reviewed by a licensed attorney and is not legal advice. MORT must complete a formal legal review — including state-specific youth employment and marketplace regulations — before any public or commercial launch.
        </div>

        <Section title="1. What MORT is">
          <p>MORT is a local marketplace that helps teens ages 13–17 find short-term, informal paid work (&quot;hustles&quot;) posted by adults and small businesses in their community, with built-in guardian oversight and safety tooling.</p>
        </Section>

        <Section title="2. Guardian involvement">
          <p>Teen accounts can be connected to a guardian using an invite code. Guardians may require their teen&apos;s job applications to receive guardian approval before the application is sent to the job poster, and can view their connected teen&apos;s safety pings and job activity.</p>
          <p>MORT does not independently verify that a &quot;guardian&quot; account is a teen&apos;s legal parent or guardian. Families are responsible for setting up guardian connections accurately and honestly.</p>
        </Section>

        <Section title="3. Adult and business responsibility">
          <p>Adults and businesses that want to post jobs must submit a verification request and be approved by a MORT admin before posting. Approval reflects only that basic verification information was reviewed — it is not a background check, license check, or guarantee of the poster&apos;s character or intentions.</p>
          <p>Adults are responsible for providing accurate job descriptions, safe working conditions, and lawful pay practices, and for complying with all applicable child labor and local employment laws.</p>
        </Section>

        <Section title="4. No guaranteed work or income">
          <p>MORT does not guarantee that any job will be available, that any application will be accepted, or that a teen will earn any particular amount of income. Job availability depends entirely on what adults and businesses choose to post.</p>
        </Section>

        <Section title="5. No payment processing or guaranteed payment">
          <p>MORT does not process payments, move money, hold funds in escrow, or collect bank account or payment card information. &quot;Payment preferences&quot; shown on a job or profile are informational only — they reflect how a user says they&apos;d like to be paid (e.g. cash, a peer payment app) and are not verified, guaranteed, or facilitated by MORT.</p>
          <p>Any payment for work happens directly between the teen (with guardian involvement where applicable) and the adult, entirely off-platform. MORT is not a party to that payment and is not responsible for non-payment, underpayment, or payment disputes.</p>
        </Section>

        <Section title="6. Staying on-platform and off-platform safety">
          <p>Users agree not to pressure others to move communication or payment off MORT before a safe, appropriate point, and not to request sensitive personal information (home address, financial account details, passwords, etc.) through the platform.</p>
          <p>MORT cannot control what happens once two users choose to interact off-platform (in person or otherwise). Users take on that risk directly, and are strongly encouraged to keep a trusted adult informed of job locations and schedules.</p>
        </Section>

        <Section title="7. Reports and moderation">
          <p>Users can report jobs, users, or messages at any time. MORT admins review reports and may take action including warning a user, removing content, or suspending an account. MORT does not promise a specific response time or outcome for any report.</p>
        </Section>

        <Section title="8. Account suspension and termination">
          <p>MORT may suspend or terminate any account that violates these terms, community safety expectations, or applicable law, with or without notice, at MORT&apos;s discretion.</p>
        </Section>

        <Section title="9. Safety limitations">
          <p>MORT provides safety tools (safety pings, guardian oversight, reporting, moderated messaging) as an aid, not a guarantee of safety. MORT does not provide real-time monitoring, live location tracking, or dispatch services.</p>
        </Section>

        <Section title="10. Emergency disclaimer">
          <p><strong>MORT is not a replacement for calling 911 or local emergency services.</strong> If you or someone else is in immediate danger, contact emergency services first. Do not rely on MORT&apos;s in-app safety features for time-critical emergencies.</p>
        </Section>

        <Section title="11. Changes to these terms">
          <p>MORT may update these terms as the product evolves. Continued use of MORT after changes take effect constitutes acceptance of the updated terms.</p>
        </Section>
      </main>
    </>
  )
}
