import Link from 'next/link'
import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions } from '@/components/ui'
import { Toast } from '@/components/toast'

export const dynamic = 'force-dynamic'

export default async function Support({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  await requireUser()
  const params = await searchParams
  return (
    <>
      <PageHeaderWithActions title="Help & support" eyebrow="MORT support" description="Find the right next step without sending private documents or payment details through an unsupported channel." />
      <Toast message={params?.message} />
      <section className="card support-unavailable">
        <span className="small">SUPPORT TICKETS</span>
        <h2>Ticket support is not available yet.</h2>
        <p>The active production backend does not currently expose the support-ticket tables or RPCs needed for a secure ticket inbox. MORT has not submitted or stored a support ticket from this page.</p>
      </section>
      <div className="grid two" style={{ marginTop: 16 }}>
        <section className="card">
          <h3>Report a safety or privacy concern</h3>
          <p style={{ marginTop: 6 }}>Use the supported reporting flow to submit a concern about a job, message, or account.</p>
          <Link href="/app/reports/new" className="btn primary" style={{ marginTop: 16 }}>Submit a report</Link>
        </section>
        <section className="card">
          <h3>Immediate danger</h3>
          <p style={{ marginTop: 6 }}>MORT is not an emergency-response service. If you or someone else may be in immediate danger, contact 911 or your local emergency service first.</p>
          <Link href="/app/safety" className="text-link" style={{ marginTop: 14, display: 'inline-block' }}>Teen Safety Center</Link>
        </section>
      </div>
      <p className="muted" style={{ marginTop: 16 }}>Do not send passwords, full card numbers, bank details, Social Security numbers, or identity documents to MORT through chat or an unapproved upload flow.</p>
    </>
  )
}
