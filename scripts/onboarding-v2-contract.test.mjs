import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('auth bootstraps the profile through the production RPC only', () => {
  const auth = read('../lib/auth.ts')
  assert.match(auth, /rpc\(['"]ensure_my_profile['"]\)/)
  assert.doesNotMatch(auth, /from\(['"]profiles['"]\)\s*\.(insert|upsert)/)
  assert.doesNotMatch(auth, /account_status\s*:\s*['"]active['"]/)
})

test('onboarding server actions use the four v2 RPCs, not direct profile writes', () => {
  const actions = read('../app/app/actions.ts')
  for (const rpc of [
    'save_my_onboarding_account_v2',
    'save_my_onboarding_work_v2',
    'save_my_onboarding_safety_v2',
    'complete_my_onboarding_v2',
    'get_my_legal_requirements',
  ]) {
    assert.ok(actions.includes(rpc), `missing ${rpc}`)
  }
  assert.doesNotMatch(actions, /from\(['"]profiles['"]\)\s*\.(insert|upsert|update)/)
  assert.doesNotMatch(actions, /onboarding_completed\s*:/)
  assert.doesNotMatch(actions, /account_status\s*:\s*['"]active['"]/)
})

test('email callback reads the production onboarding completion column', () => {
  const callback = read('../app/auth/callback/route.ts')
  assert.match(callback, /onboarding_completed_at/)
  assert.doesNotMatch(callback, /select\(['"]onboarding_completed['"]\)/)
})

test('web onboarding preserves all four server-defined steps and legal clickwrap', () => {
  const form = read('../components/onboarding-form.tsx')
  assert.match(form, /account/)
  assert.match(form, /work_preferences/)
  assert.match(form, /safety_support/)
  assert.match(form, /review/)
  assert.match(form, /accepted_version_ids/)
  assert.match(form, /requires_electronic_signature/)
  assert.match(form, /Guardian Mode is optional/)
})
