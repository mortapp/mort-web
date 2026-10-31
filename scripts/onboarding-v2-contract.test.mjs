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

test('website signup enforces the 13+ DOB screen before creating accounts', () => {
  const signup = read('../app/(auth)/signup/page.tsx')
  const actions = read('../app/(auth)/actions.ts')
  const callback = read('../app/auth/callback/route.ts')
  assert.match(signup, /name="date_of_birth" type="date"[^>]*required/)
  assert.match(signup, /age 13 and older/)
  assert.match(actions, /age < 13/)
  assert.match(actions, /date_of_birth: dob/)
  assert.match(actions, /MORT is only available to people age 13 or older/)
  assert.match(callback, /save_my_initial_dob_v1/)
  assert.match(callback, /age < 13/)
})

test('all authenticated website pages require DOB while onboarding remains reachable', () => {
  const auth = read('../lib/auth.ts')
  const layout = read('../app/app/layout.tsx')
  const onboarding = read('../app/app/onboarding/page.tsx')
  assert.match(auth, /export async function requireAuthenticatedUser/)
  assert.match(auth, /export async function requireUser/)
  assert.match(auth, /!ctx\.profile\?\.date_of_birth/)
  assert.match(auth, /\/app\/onboarding/)
  assert.match(layout, /requireAuthenticatedUser/)
  assert.match(onboarding, /requireAuthenticatedUser/)
})

test('website renders the hybrid identity policy without collecting raw ID documents', () => {
  const onboarding = read('../app/app/onboarding/page.tsx')
  assert.match(onboarding, /get_my_verification_requirements_v1/)
  assert.match(onboarding, /school-issued photo ID/)
  assert.match(onboarding, /official enrollment confirmation/)
  assert.match(onboarding, /government-issued photo ID/)
  assert.match(onboarding, /document submission is currently disabled/)
  assert.match(onboarding, /Do not email or upload identity documents/)
})

test('only the DOB-saving onboarding action bypasses the initial DOB gate', () => {
  const actions = read('../app/app/actions.ts')
  assert.match(actions, /saveOnboardingAccount\(formData: FormData\)[\s\S]*?requireAuthenticatedUser\(\)/)
  assert.match(actions, /saveOnboardingWork\(formData: FormData\)[\s\S]*?requireUser\(\)/)
  assert.match(actions, /saveOnboardingSafety\(formData: FormData\)[\s\S]*?requireUser\(\)/)
  assert.match(actions, /completeOnboarding\(formData: FormData\)[\s\S]*?requireUser\(\)/)
})
