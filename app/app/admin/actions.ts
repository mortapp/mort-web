'use server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

function v(fd: FormData, k: string) {
  const x = fd.get(k)
  return x == null ? null : String(x).trim()
}

function fail(message: string) {
  redirect(`/app/admin?error=${encodeURIComponent(message)}`)
}

const VERIFICATION_OUTCOMES: Record<string, string> = {
  verified: 'Verification approved.',
  rejected: 'Verification rejected.',
  needs_review: 'Marked as needs more review.',
}
const ACCOUNT_STATUSES = new Set(['active'])

export async function reviewVerificationCase(formData: FormData) {
  const { supabase } = await requireRole(['admin'])
  const caseId = v(formData, 'case_id')
  const status = v(formData, 'status') || ''
  const note = v(formData, 'note')

  if (!caseId) fail('Missing verification case id.')
  if (!(status in VERIFICATION_OUTCOMES)) fail('Invalid verification outcome.')

  // Positive approvals require an explicit, case-bound document-review
  // attestation (issue #50): the reviewer confirms they examined the uploaded
  // evidence document. The attestation is recorded first; the gated review
  // RPC below then consumes it — staff approval alone cannot verify.
  if (status === 'verified') {
    const { data: attestation, error: attestationError } = await supabase.rpc(
      'mort_record_staff_document_review',
      { p_case_id: caseId, p_decision: 'verified', p_note: note || null },
    )
    if (attestationError) fail(`Document review failed: ${attestationError.message}`)
    if (!attestation?.ok) fail(`Document review failed: ${attestation?.code || 'rejected by backend.'}`)
  }

  // Staff decisions go through the guarded database function, which checks the
  // reviewer role, enforces the minimum-age rule, updates the profile status,
  // and writes the audit log. Clients can no longer write verification_status.
  const { data: reviewResult, error } = await supabase.rpc('mort_review_verification_case', {
    p_case_id: caseId,
    p_status: status,
    p_note: note || null,
    p_expires_at: null,
  })

  if (error) fail(`Verification review failed: ${error.message}`)
  if (reviewResult?.ok !== true) {
    fail(`Verification review failed: ${reviewResult?.message || reviewResult?.code || 'the backend rejected the decision.'}`)
  }
  redirect('/app/admin?message=' + encodeURIComponent(VERIFICATION_OUTCOMES[status]))
}

export async function updateReportStatus(formData: FormData) {
  await requireRole(['admin'])
  fail('Report status changes are unavailable: the production backend does not expose a staff report-review RPC yet.')
}

export async function updateUserStatus(formData: FormData) {
  const { supabase } = await requireRole(['admin'])
  const userId = v(formData, 'user_id')
  const status = v(formData, 'account_status') || ''

  if (!userId) fail('Missing user id.')
  if (!ACCOUNT_STATUSES.has(status)) {
    fail('Direct suspension and restoration are not supported here. Only eligible pending activation requests can be approved.')
  }

  const { data, error } = await supabase.rpc('admin_set_account_status_v2', {
    p_user_id: userId,
    p_status: status,
    p_reason_code: 'web_admin_activation',
    p_reason: 'Activation approved from MORT web admin.',
    p_expires_at: null,
  })

  if (error) fail(`User status update failed: ${error.message}`)
  if (data?.ok !== true) {
    const message = data?.code === 'activation_request_required'
      ? 'No pending activation request exists for this account. Confirm onboarding and required verification are complete, then refresh the admin queue.'
      : data?.code === 'account_status_request_invalid'
        ? 'This action only approves eligible pending activation requests; it cannot suspend or restore accounts.'
        : data?.message || data?.code || 'User status update rejected by backend.'
    fail(message)
  }
  redirect('/app/admin?message=User status updated')
}
