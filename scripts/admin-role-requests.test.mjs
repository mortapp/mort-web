import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const page = readFileSync(new URL('../app/app/admin/page.tsx', import.meta.url), 'utf8')
const actions = readFileSync(new URL('../app/app/admin/actions.ts', import.meta.url), 'utf8')

test('admin activation queue uses pending role requests, not arbitrary pending profiles', () => {
  assert.match(page, /from\('role_requests'\)/)
  assert.match(page, /\.eq\('status', 'pending'\)/)
  assert.match(page, /userList\.map/)
  assert.match(page, /requestsByUser\.get\(user\.id\)/)
  assert.match(page, /No pending activation request/)
  assert.doesNotMatch(page, /updateUserStatus/)
})

test('admin activation queue offers both approval and rejection for each real request', () => {
  assert.match(page, /name="decision" value="approve"/)
  assert.match(page, /name="decision" value="reject"/)
  assert.match(page, /Rejection reason \(required for reject\)/)
  assert.match(page, /roleRequestsError/)
})

test('role review calls the guarded RPC and requires an audit reason for rejection', () => {
  assert.match(actions, /supabase\.rpc\('mort_review_role_request'/)
  assert.match(actions, /p_request_id: requestId/)
  assert.match(actions, /p_approve: decision === 'approve'/)
  assert.match(actions, /decision === 'reject' && \(!reason \|\| reason\.length < 3\)/)
  assert.match(actions, /pending role request not found/)
  assert.match(actions, /String\(data\)\.toLowerCase\(\) !== requestId\.toLowerCase\(\)/)
  assert.doesNotMatch(actions, /admin_set_account_status_v2/)
})
