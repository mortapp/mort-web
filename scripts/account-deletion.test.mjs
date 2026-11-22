import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { confirmedDeletion, deletionStatus, parseReceipt } from '../lib/account-deletion.mjs'

test('receipt accepts only an opaque 256-bit value, not an account or request ID', () => {
  assert.equal(parseReceipt(' AB'.padEnd(65, '9')), ('ab' + '9'.repeat(62)))
  for (const invalid of [null, {}, '', 'a'.repeat(63), 'a'.repeat(65), 'g'.repeat(64), '95f73417-74bd-493f-9518-8c97b1343463']) {
    assert.equal(parseReceipt(invalid), null)
  }
})

test('confirmation is explicit and only a completed request is shown as deleted', () => {
  assert.equal(confirmedDeletion(' DELETE '), true)
  for (const invalid of [null, 'yes', 'delete', 'DELETE MY ACCOUNT']) assert.equal(confirmedDeletion(invalid), false)
  for (const status of ['requested', 'processing', 'retry_pending', 'retention_review', 'cancelled', 'failed']) {
    assert.ok(deletionStatus(status))
    assert.doesNotMatch(deletionStatus(status), /account was deleted/)
  }
  assert.match(deletionStatus('completed'), /account was deleted/)
  assert.equal(deletionStatus('constructor'), null)
})

test('web verification never provisions an account, and receipt is not placed in a URL', () => {
  const actions = readFileSync(new URL('../app/account-deletion/actions.ts', import.meta.url), 'utf8')
  const callback = readFileSync(new URL('../app/account-deletion/confirm/route.ts', import.meta.url), 'utf8')
  assert.match(actions, /shouldCreateUser:\s*false/)
  assert.match(actions, /httpOnly:\s*true/)
  assert.doesNotMatch(actions, /redirect\([^)]*(?:receiptCode|p_receipt)/)
  assert.match(callback, /exchangeCodeForSession/)
  assert.doesNotMatch(callback, /request_account_deletion|deleteUser/)
})
