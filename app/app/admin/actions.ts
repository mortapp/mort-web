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

const VERIFICATION_STATUSES = new Set(['approved', 'rejected'])
const REPORT_STATUSES = new Set(['open', 'reviewing', 'resolved', 'dismissed'])
const ACCOUNT_STATUSES = new Set(['active', 'suspended'])

export async function reviewBusinessVerification(formData: FormData) {
  const { supabase } = await requireRole(['admin'])
  const adultId = v(formData, 'adult_id')
  const status = v(formData, 'status') || 'pending'

  if (!adultId) fail('Missing adult profile id.')
  if (!VERIFICATION_STATUSES.has(status)) fail('Invalid verification status.')

  // Live Supabase has no business_verifications UPDATE policy and no simple
  // admin-review RPC for this legacy table. For closed web testing, mark the
  // adult profile verification_status so job-post gating can be exercised.
  // Do not treat this as production business verification.
  const { error } = await supabase
    .from('profiles')
    .update({ verification_status: status, updated_at: new Date().toISOString() })
    .eq('id', adultId)

  if (error) fail(`Verification profile update failed: ${error.message}`)
  redirect('/app/admin?message=Adult profile verification updated for closed testing')
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
