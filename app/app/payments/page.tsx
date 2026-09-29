import { requireUser } from '@/lib/auth'
import { savePaymentPreference } from '@/app/app/actions'
import { PageHeaderWithActions } from '@/components/ui'
import { SubmitButton } from '@/components/submit-button'
import { Toast } from '@/components/toast'
export const dynamic = 'force-dynamic'

export default async function Payments({ searchParams }: { searchParams?: Promise<Record<string,string>> }) {
  const { profile } = await requireUser()
  const sp = await searchParams
  const pref = profile?.payment_preference || 'none'
  return (
    <>
      <PageHeaderWithActions title="Payment preferences" eyebrow="Preference-only / fail-closed">
        <p>MORT does not process, move, hold, guarantee, or enforce payments. The live backend currently has no safe RPC for payment preference writes, so this screen is read-only until that backend gap is closed.</p>
      </PageHeaderWithActions>
      <Toast message={sp?.message} />

      <div className="warning-box" style={{ marginBottom: 20 }}>
        ⚠️ Payment preference saving is disabled by design in this web build. Do not add bank details, card numbers, SSNs, or service-role keys.
      </div>

      <form action={savePaymentPreference} className="card form" style={{ maxWidth: 480 }}>
        <label>Current profile preference<input value={pref} readOnly /></label>
        <label>
          Preference
          <select name="preference" defaultValue={pref} disabled>
            <option value="cash">Cash</option>
            <option value="cash_app">Cash App</option>
            <option value="square_link">Square link</option>
            <option value="flexible">Flexible</option>
            <option value="none">None yet</option>
          </select>
        </label>
        <label>Cash App tag<input name="cash_app_tag" placeholder="$yourtag" disabled /></label>
        <label>Square URL<input name="square_url" disabled /></label>
        <label>Note<textarea name="note" disabled /></label>
        <SubmitButton pendingLabel="Checking…">Why can&apos;t I save?</SubmitButton>
      </form>
    </>
  )
}
