import { requireUser } from '@/lib/auth'
import { FinancialHistory } from './financial-history'
import { StripeFundingPanel } from './stripe-funding-panel'

export const dynamic = 'force-dynamic'

export default async function Payments() {
  const { profile, supabase, user } = await requireUser()
  const role = profile?.role
  const canViewHistory = role === 'adult' || role === 'teen'

  let historyItems: Record<string, unknown>[] = []
  let historyMessage: string | null = null
  if (canViewHistory) {
    const { data, error } = await supabase.functions.invoke('stripe-list-financial-history', {
      body: { limit: 50 },
    })
    if (error || data?.ok !== true || !Array.isArray(data?.items)) {
      historyMessage = 'Financial history is temporarily unavailable. It remains restricted to the authenticated contract participants.'
    } else {
      historyItems = data.items as Record<string, unknown>[]
    }
  }

  let contracts: { id: string; created_at: string | null }[] = []
  let contractMessage: string | null = null
  if (role === 'adult') {
    const { data, error } = await supabase
      .from('job_contracts')
      .select('id, created_at')
      .eq('adult_id', user.id)
      .eq('status', 'active')
      .not('active_version_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(25)
    if (error) {
      contractMessage = 'Active agreements could not be loaded. No payment action is available until the server can verify an agreement.'
    } else {
      contracts = (data ?? []) as { id: string; created_at: string | null }[]
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">MORT financial activity</p>
          <h1>Payments and receipts</h1>
          <p>Payment amounts and states come from MORT’s server and Stripe. A payment is never described as escrow, and no transfer is implied by a charge.</p>
        </div>
      </header>

      {role === 'adult' && (
        <section aria-labelledby="adult-funding-title">
          <h2 id="adult-funding-title">Fund an accepted agreement</h2>
          <p className="muted">The server verifies the adult payer, active agreement, obligation, pricing policy, runtime controls, and recipient eligibility. You review a fresh quote before entering Stripe’s secure payment form.</p>
          {contractMessage && <div className="warning-box">{contractMessage}</div>}
          {!contractMessage && contracts.length === 0 && (
            <p className="muted">No active accepted agreements are available for funding.</p>
          )}
          {contracts.map((contract, index) => (
            <StripeFundingPanel
              key={contract.id}
              contractId={contract.id}
              jobTitle={`Active MORT agreement ${index + 1}${contract.created_at ? ` · ${new Date(contract.created_at).toLocaleDateString()}` : ''}`}
            />
          ))}
        </section>
      )}

      {role === 'teen' && (
        <section className="warning-box" aria-labelledby="recipient-model-title">
          <h2 id="recipient-model-title">Recipient payout setup is not available</h2>
          <p>MORT is waiting for written Stripe approval and qualified legal/tax review of the U.S. minor recipient and guardian model. Do not enter identity or bank information here. No teen payout or connected-account onboarding is enabled from this page.</p>
        </section>
      )}

      {role !== 'adult' && role !== 'teen' && (
        <section className="warning-box">
          <p>Financial history and payment actions are available only to authenticated adult payers or contract participants.</p>
        </section>
      )}

      <section aria-labelledby="history-title">
        <h2 id="history-title">Financial history</h2>
        {canViewHistory
          ? <FinancialHistory items={historyItems} message={historyMessage} />
          : <p className="muted">Sign in as an adult payer or teen contract participant to view financial history.</p>}
      </section>
    </>
  )
}
