import { requireUser } from '@/lib/auth'
import { PageHeaderWithActions } from '@/components/ui'
import { Toast } from '@/components/toast'

export const dynamic = 'force-dynamic'

export default async function Payments({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  await requireUser()
  const sp = await searchParams
  return (
    <>
      <PageHeaderWithActions title="Payments & payouts" eyebrow="Not enabled in production" description="Payment setup will appear here only when the approved provider, Guardian-owned payout model, and required production safeguards are available." />
      <Toast message={sp?.message} />
      <section className="card payment-unavailable">
        <span className="small">PAYMENT STATUS</span>
        <h2>Payment processing is disabled.</h2>
        <p>MORT does not currently collect, hold, fund, transfer, refund, or pay out job compensation. No bank account, debit card, credit card, tax identifier, or payout credentials are collected on this page.</p>
        <p>The published MORT Terms require marketplace payments through the approved payment provider. Do not arrange cash, Cash App, Square, or other off-platform payments through MORT.</p>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h3>What must be ready first</h3>
        <ul style={{ paddingLeft: 20, marginTop: 10, display: 'grid', gap: 8 }}>
          <li>Verified adult and Guardian-owned payout account requirements.</li>
          <li>Production payment funding, transfers, refunds, and dispute handling.</li>
          <li>Webhook idempotency, reconciliation, and operational monitoring.</li>
          <li>Clear fee disclosure and teen-safe payment status history.</li>
        </ul>
      </section>
    </>
  )
}
