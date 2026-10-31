import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8')

test('auth bootstraps the profile through the production RPC only', () => {
  const auth = read('../lib/auth.ts')
  assert.match(auth, /rpc\(['"]ensure_my_profile['"]\)/)
  assert.doesNotMatch(auth, /from\(['"]profiles['"]\)\s*\.(insert|upsert)/)
  assert.doesNotMatch(auth, /account_status\s*:\s*['"]active['"]/)
  assert.match(auth, /account_status !== 'active'/)
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
  assert.match(actions, /content_markdown/)
  assert.match(actions, /submit_legal_acceptance/)
  assert.match(actions, /p_teen_summary_viewed/)
})

test('email callback reads the production onboarding completion column', () => {
  const callback = read('../app/auth/callback/route.ts')
  assert.match(callback, /onboarding_completed_at/)
  assert.match(callback, /account_status !== 'active'/)
  assert.doesNotMatch(callback, /select\(['"]onboarding_completed['"]\)/)
})

test('web onboarding preserves all four server-defined steps and legal clickwrap', () => {
  const form = read('../components/onboarding-form.tsx')
  const actions = read('../app/app/actions.ts')
  assert.match(form, /account/)
  assert.match(form, /work_preferences/)
  assert.match(form, /safety_support/)
  assert.match(form, /review/)
  assert.match(form, /accepted_version_ids/)
  assert.match(form, /requires_electronic_signature/)
  assert.match(form, /Guardian Mode is optional/)
  assert.match(form, /name="teen_summary_viewed"/)
  assert.match(form, /function isAdultDateOfBirth/)
  assert.match(form, /Adult account type/)
  assert.match(form, /name="city"[^>]*required/)
  assert.match(form, /name="state"[^>]*required/)
  assert.match(form, /name="approximate_area"[^>]*required/)
  assert.doesNotMatch(form, /name="preferred_job_categories"[^>]*required=\{index === 0\}/)
  assert.doesNotMatch(form, /name="transportation_methods"[^>]*required=\{index === 0\}/)
  assert.match(actions, /onboarding_work_preferences_required:/)
})

test('pending and incomplete accounts cannot reach role dashboards', () => {
  const auth = read('../lib/auth.ts')
  assert.match(auth, /onboarding_completed_at/)
  for (const role of ['teen', 'adult', 'guardian', 'admin']) {
    const layout = read(`../app/app/${role}/layout.tsx`)
    assert.match(layout, /requireRole/)
    assert.match(layout, new RegExp(`\\['${role}'\\]`))
  }
  const dashboard = read('../app/app/page.tsx')
  assert.match(dashboard, /account_status !== 'active'/)
  assert.match(dashboard, /onboarding_completed_at/)
})
