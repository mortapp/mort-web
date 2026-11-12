'use server'
import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'

function v(fd: FormData, k: string) {
  const x = fd.get(k)
  return x == null ? null : String(x).trim()
}

function fail(message: string) {
  redirect(`/app/admin?message=${encodeURIComponent(message)}`)
}

const VERIFICATION_OUTCOMES: Record<string, string> = {
  verified: 'Verification approved.',
  rejected: 'Verification rejected.',
  needs_review: 'Marked as needs more review.',
}
const REPORT_STATUSES = new Set(['open', 'reviewing', 'resolved', 'dismissed'])
const ACCOUNT_STATUSES = new Set(['active', 'suspended'])

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
  const { error } = await supabase.rpc('mort_review_verification_case', {
    p_case_id: caseId,
    p_status: status,
    p_note: note || null,
    p_expires_at: null,
  })

  if (error) fail(`Verification review failed: ${error.message}`)
  redirect('/app/admin?message=' + encodeURIComponent(VERIFICATION_OUTCOMES[status]))
}

export async function updateReportStatus(formData: FormData) {
  const { supabase } = await requireRole(['admin'])
  const reportId = v(formData, 'id')
  const status = v(formData, 'status') || 'reviewing'

  if (!reportId) fail('Missing report id.')
  if (!REPORT_STATUSES.has(status)) fail('Invalid report status.')

  const { data, error } = await supabase.rpc('admin_update_report_status', {
    p_report_id: reportId,
    p_status: status,
    p_reason: 'MORT web admin review',
  })

  if (error) fail(`Report update failed: ${error.message}`)
  if (data && data.ok === false) fail(data.message || data.code || 'Report update rejected by backend.')
  redirect('/app/admin?message=Report updated')
}

export async function updateUserStatus(formData: FormData) {
  const { supabase } = await requireRole(['admin'])
  const userId = v(formData, 'user_id')
  const status = v(formData, 'account_status') || ''

  if (!userId) fail('Missing user id.')
  if (!ACCOUNT_STATUSES.has(status)) fail('Invalid account status.')

  const { data, error } = await supabase.rpc('admin_set_account_status_v2', {
    p_user_id: userId,
    p_status: status,
    p_reason_code: status === 'suspended' ? 'web_admin_suspension' : 'web_admin_reactivation',
    p_reason: status === 'suspended' ? 'Suspended from MORT web admin.' : 'Reactivated from MORT web admin.',
    p_expires_at: null,
  })

  if (error) fail(`User status update failed: ${error.message}`)
  if (data && data.ok === false) fail(data.message || data.code || 'User status update rejected by backend.')
  redirect('/app/admin?message=User status updated')
}
