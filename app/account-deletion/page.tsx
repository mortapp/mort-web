import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { AuthShell } from '@/components/auth-shell'
import { SubmitButton } from '@/components/submit-button'
import { createClient } from '@/lib/supabase/server'
import { deletionStatus, parseReceipt, receiptCookie } from '@/lib/account-deletion.mjs'
import {
  cancelDeletionRequest, findDeletionReceipt, forgetDeletionReceipt, renewDeletionReceipt,
  sendDeletionVerification, submitDeletionRequest, verifyDeletionAuthenticator, verifyDeletionPassword,
} from './actions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Delete your MORT account',
  description: 'Request or check the status of MORT account and associated data deletion.',
  robots: { index: false, follow: true },
}

const notices: Record<string, string> = {
  verify_failed: 'We could not verify those credentials. Try again or request an email link.',
  mfa_failed: 'We could not verify that authenticator code. Use a current code from your authenticator or contact MORT Support.',
  verified: 'Identity verified. You have not submitted a deletion request yet.',
  invalid_email: 'Enter a valid email address.',
  check_email: 'If that address matches an existing MORT account, check your inbox for a verification link. Open it in this browser. No deletion request has been submitted.',
  link_invalid: 'That link could not be verified. Request another link and open it in the same browser.',
  confirmation_required: 'Type DELETE to confirm you want to submit the request.',
  reauth_required: 'Verify your identity again before submitting or cancelling.',
  rate_limited: 'Too many deletion requests. Try again later or contact MORT Support.',
  unavailable: 'The deletion service did not confirm the action. Try again or contact MORT Support.',
  saved: 'Deletion requested, not completed. Save your private receipt code to check the status later.',
  saved_no_receipt: 'Your request is recorded, but a receipt could not be issued. Check the status here or contact MORT Support.',
  receipt_unavailable: 'A receipt could not be issued. Verify your identity again or contact MORT Support.',
  receipt_issued: 'A new receipt code was issued. Your old code will no longer work.',
  receipt_found: 'Receipt found. See the status below.',
  receipt_not_found: 'No status was found for that code. Check the code and try again.',
  cancelled: 'Deletion request cancelled.',
  cancel_unavailable: 'Cancellation was not confirmed. Check whether processing has already started.',
}

export default async function AccountDeletion({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const result = (await searchParams).result
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const authd = !!user?.email_confirmed_at
  const assurance = authd ? await supabase.auth.mfa.getAuthenticatorAssuranceLevel() : null
  const needsMfa = assurance?.data?.nextLevel === 'aal2' && assurance.data.currentLevel !== 'aal2'
  const factors = needsMfa ? await supabase.auth.mfa.listFactors() : null
  const totp = factors?.data?.totp.filter((factor) => factor.status === 'verified') ?? []
  const owned = authd && !needsMfa && !assurance?.error ? await supabase.rpc('get_my_account_deletion_request') : null
  const canLoad = !authd || (needsMfa && !factors?.error) || owned?.data?.ok === true
  const request = owned?.data?.ok === true ? owned.data.request : null
  const receiptCode = parseReceipt((await cookies()).get(receiptCookie)?.value)
  const receipt = receiptCode
    ? await supabase.rpc('get_account_deletion_receipt_status', { p_receipt: receiptCode })
    : null
  const receiptStatus = deletionStatus(receipt?.data?.status)
  const needsVerification = !authd || result === 'reauth_required' || result === 'verify_failed'
  const resultConfirmed =
    (result !== 'verified' || (authd && !needsMfa && !assurance?.error)) &&
    (!['saved', 'receipt_issued', 'receipt_found'].includes(result ?? '') || !!receiptStatus) &&
    (result !== 'saved_no_receipt' || !!request) &&
    (result !== 'cancelled' || request?.status === 'cancelled' || receipt?.data?.status === 'cancelled')
  return (
    <AuthShell kicker="Account privacy" title="Delete your MORT account"
      description="Request deletion of your MORT account and associated personal data right here. You do not need to download the app."
      bullets={[
        { icon: '1', text: 'Verify the email address on your account.' },
        { icon: '2', text: 'Confirm and submit your deletion request.' },
        { icon: '3', text: 'Save a private receipt to check the request later.' },
      ]}>
      {resultConfirmed && typeof result === 'string' && Object.hasOwn(notices, result) && <p role="status">{notices[result]}</p>}
      {!canLoad && <p role="alert">Your request status is temporarily unavailable. Please try again.</p>}
      {needsVerification && <section aria-labelledby="deletion-verify">
        <h2 id="deletion-verify">Verify your identity</h2>
        <form className="form" action={verifyDeletionPassword}>
          <label>Account email <input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label>Account password <input name="password" type="password" autoComplete="current-password" required maxLength={1024} /></label>
          <SubmitButton pendingLabel="Verifying…">Verify with password</SubmitButton>
        </form>
        <details>
          <summary>Use an email link instead</summary>
          <form className="form" action={sendDeletionVerification}>
            <label>Account email for verification link <input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
            <SubmitButton pendingLabel="Requesting link…">Send verification link</SubmitButton>
          </form>
        </details>
      </section>}
      {needsMfa && <section aria-labelledby="deletion-mfa">
        <h2 id="deletion-mfa">Verify your second factor</h2>
        {totp.length > 0 ? <form className="form" action={verifyDeletionAuthenticator}>
          <label>Authenticator <select name="factorId" required>
            {totp.map((factor, index) => <option key={factor.id} value={factor.id}>{factor.friendly_name || `Authenticator ${index + 1}`}</option>)}
          </select></label>
          <label>Six-digit authenticator code <input name="code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required /></label>
          <SubmitButton pendingLabel="Verifying…">Verify authenticator</SubmitButton>
        </form> : <p>This browser flow cannot verify your enrolled factor. Contact MORT Support to request deletion without sharing your password or authentication codes.</p>}
      </section>}
      {authd && canLoad && !needsMfa && <section aria-labelledby="deletion-request">
        <h2 id="deletion-request">Your deletion request</h2>
        {request && <p>{deletionStatus(request.status) ?? 'Status temporarily unavailable.'}</p>}
        {request?.status === 'requested' && <form className="form" action={cancelDeletionRequest}>
          <SubmitButton pendingLabel="Cancelling…">Cancel pending request</SubmitButton>
        </form>}
        {!needsVerification && (!request || ['cancelled', 'failed'].includes(request.status)) &&
          <form className="form" action={submitDeletionRequest}>
            <p>You can cancel before processing starts. Once processing starts, you may lose access and cannot undo deletion.</p>
            <label>Type DELETE to confirm <input name="confirmation" autoComplete="off" required maxLength={12} /></label>
            <SubmitButton pendingLabel="Submitting…">Submit deletion request</SubmitButton>
          </form>}
        {request && ['requested', 'retry_pending', 'retention_review', 'cancelled'].includes(request.status) && !receiptStatus &&
          <form className="form" action={renewDeletionReceipt}>
            <input type="hidden" name="requestId" value={request.id} />
            <SubmitButton pendingLabel="Issuing…">Issue a new receipt code</SubmitButton>
          </form>}
      </section>}
      <section aria-labelledby="deletion-status">
        <h2 id="deletion-status">Check request status</h2>
        {receiptStatus ? <>
          <p role="status">{receiptStatus}</p>
          <p>Keep this receipt private. It expires after 90 days or when replaced.</p>
          <p><code style={{ overflowWrap: 'anywhere' }}>{receiptCode}</code></p>
          <form action={forgetDeletionReceipt}><button className="btn ghost" type="submit">Forget code on this browser</button></form>
        </> : <form className="form" action={findDeletionReceipt}>
          <label>Private receipt code <input name="receipt" autoComplete="off" spellCheck={false} maxLength={64} required /></label>
          <SubmitButton pendingLabel="Checking…">Check status</SubmitButton>
        </form>}
      </section>
      <section aria-labelledby="deletion-help">
        <h2 id="deletion-help">Retention and help</h2>
        <p>MORT may retain restricted records needed for safety, fraud prevention, disputes or legal obligations. See the <Link href="/legal/privacy">MORT Privacy Policy</Link>.</p>
        <p>If you cannot access your account email, you can request help from <a href="mailto:support@mortapp.org?subject=MORT%20account%20deletion">MORT Support</a>. Do not send passwords or identity documents by email.</p>
      </section>
    </AuthShell>
  )
}
