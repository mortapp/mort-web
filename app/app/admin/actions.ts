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

export async function reviewRoleRequest(formData: FormData) {
  const { supabase } = await requireRole(['admin'])
  const requestId = v(formData, 'request_id') || ''
  const decision = v(formData, 'decision') || ''
  const reason = v(formData, 'review_note')

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    fail('Invalid activation request. Refresh the admin queue and try again.')
  }
  if (decision !== 'approve' && decision !== 'reject') {
    fail('Choose approve or reject for this activation request.')
  }
  if (reason && reason.length > 500) fail('Review note must be 500 characters or fewer.')
  if (decision === 'reject' && (!reason || reason.length < 3)) {
    fail('Enter a rejection reason of at least 3 characters.')
  }

  const { data, error } = await supabase.rpc('mort_review_role_request', {
    p_request_id: requestId,
    p_approve: decision === 'approve',
    p_reason: reason || null,
  })

  if (error) {
    if (error.message.toLowerCase().includes('pending role request not found')) {
      fail('This activation request is no longer pending. Refresh the admin queue and try again.')
    }
    fail(`Activation request review failed: ${error.message}`)
  }
  if (String(data).toLowerCase() !== requestId.toLowerCase()) {
    fail('Activation request review returned an unexpected result. Refresh the admin queue.')
  }

  const outcome = decision === 'approve' ? 'approved' : 'rejected'
  redirect(`/app/admin?message=${encodeURIComponent(`Activation request ${outcome}.`)}`)
}
