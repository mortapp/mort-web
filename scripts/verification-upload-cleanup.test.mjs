import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const action = readFileSync(new URL('../app/app/verify/actions.ts', import.meta.url), 'utf8')
const page = readFileSync(new URL('../app/app/verify/page.tsx', import.meta.url), 'utf8')
const migration = readFileSync(new URL('../supabase/migrations/20261115_allow_unregistered_verification_evidence_cleanup.sql', import.meta.url), 'utf8')

test('verification upload cleanup runs only after registration failure and uses storage removal', () => {
  assert.match(action, /if \(error \|\| !data\?\.ok\)/)
  assert.match(action, /\.from\('verification-evidence'\)[\s\S]*?\.remove\(\[path\]\)/)
  assert.match(action, /contact support for secure cleanup/)
})

test('evidence delete policy requires caller-owned UUID path with no registered case', () => {
  assert.match(migration, /auth\.uid\(\)/)
  assert.match(migration, /verification_cases vc[\s\S]*?vc\.user_id = v_user and vc\.evidence_path = p_name/)
  assert.match(migration, /for delete to authenticated[\s\S]*?can_delete_my_unregistered_verification_evidence_v1\(name\)/)
})

test('verification page shows RPC failures and fails closed when cases are pending or unavailable', () => {
  assert.match(page, /error: verificationError/)
  assert.match(page, /error: casesError/)
  assert.match(page, /verification status could not be loaded/i)
  assert.match(page, /const canSubmitEvidence =/)
  assert.match(page, /\{canSubmitEvidence \? \(/)
  assert.match(page, /verificationError \|\| casesError/)
  assert.match(page, /sp\?\.error \? 'error' : 'default'/)
})
