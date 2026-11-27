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

test('review bulk-select checks required acknowledgements only and leaves submission and signature separate', () => {
  const form = read('../components/onboarding-form.tsx')
  const actions = read('../app/app/actions.ts')
  const handler = form.match(/function selectAllRequiredAcknowledgements\([\s\S]*?\n\}/)?.[0]

  assert.ok(handler, 'missing required acknowledgement bulk-select handler')
  assert.match(handler, /input\[name="accepted_version_ids"\]\[required\], input\[name="teen_summary_viewed"\]\[required\]/)
  assert.match(handler, /if \(!acknowledgement\.checked\) acknowledgement\.click\(\)/)
  assert.doesNotMatch(handler, /\b(?:submit|requestSubmit)\s*\(/)
  assert.match(form, /<button type="button" className="btn ghost" onClick=\{selectAllRequiredAcknowledgements\}>[\s\S]*?Accept all required/)
  assert.match(form, /Finish setup remains separate; enter an electronic signature yourself if required\./)
  assert.match(actions, /const expectedIds = outstanding\.map[\s\S]*?formData\.getAll\('accepted_version_ids'\)/)
  assert.match(actions, /outstanding\.some\(\(item: any\) => item\.requires_electronic_signature === true\) && signature\.trim\(\)\.length < 3/)
  assert.match(actions, /profile\?\.role === 'teen' && outstanding\.length > 0 && !teenSummaryViewed/)
})

test('pending and incomplete accounts cannot reach role dashboards', () => {
  const auth = read('../lib/auth.ts')
  assert.match(auth, /onboarding_completed_at/)
  for (const role of ['teen', 'adult', 'guardian', 'admin']) {
    const layout = read(`../app/app/${role}/layout.tsx`)
    assert.match(layout, /requireRole/)
    // The adult layout also admits admins, matching its pages, which the
    // admin app shell links to (adult home, post a job, my jobs).
    assert.match(layout, new RegExp(`\\['${role}`))
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

test('signup shows teen, adult, and guardian paths plus the approved-school-email requirement before account details', () => {
  const signup = read('../app/(auth)/signup/page.tsx')
  const actions = read('../app/(auth)/actions.ts')
  const formStart = signup.indexOf('<form action={signUp}')
  const roleChoicesEnd = signup.indexOf('<label>\n          Date of birth')
  const dobField = signup.indexOf('name="date_of_birth"')
  const displayNameField = signup.indexOf('name="display_name"')
  const emailField = signup.indexOf('name="email"')

  assert.ok(formStart >= 0 && roleChoicesEnd > formStart)
  assert.ok(dobField > roleChoicesEnd && displayNameField > dobField && emailField > displayNameField)
  assert.match(signup, /<fieldset className="signup-path-fieldset">[\s\S]*?legend>Choose your path/)
  assert.match(signup, /name="role" value="teen" defaultChecked=\{role === 'teen'\}/)
  assert.match(signup, /name="role" value="adult" defaultChecked=\{role === 'adult'\}/)
  assert.match(signup, /name="role" value="guardian" defaultChecked=\{role === 'guardian'\}/)
  assert.match(signup, /I’m a teen/)
  assert.match(signup, /I’m an adult/)
  assert.match(signup, /I’m a guardian \/ parent/)
  assert.match(signup, /To continue teen onboarding,[\s\S]*?verified school email address on an approved school domain/)
  assert.match(signup, /Your date of birth—not this selection—determines your age group/)
  assert.match(actions, /function signupRole\(formData: FormData, age: number\)[\s\S]*?if \(age < 18\) return 'teen'[\s\S]*?sanitizeRole\(formData\.get\('role'\)\)[\s\S]*?selected === 'teen' \? 'adult' : selected/)
  assert.match(actions, /checkedSignupDob\(formData, `\/signup\?next=/)
})

test('homepage routes teen and adult intent into a role-matched signup with safe return paths', () => {
  const home = read('../components/mort-marketing-home.tsx')
  const signup = read('../app/(auth)/signup/page.tsx')
  assert.match(home, /const nextPath = role === 'teen' \? '\/app\/teen\/jobs' : '\/app'/)
  assert.match(home, /`\/signup\?role=\$\{role\}&next=\$\{encodeURIComponent\(nextPath\)\}`/)
  assert.match(signup, /function requestedRole\(value: string \| undefined\)/)
  assert.match(signup, /defaultChecked=\{role === 'teen'\}/)
  assert.match(signup, /defaultChecked=\{role === 'adult'\}/)
})

test('login and signup preserve exact /app through email and auth callbacks', () => {
  const login = read('../app/(auth)/login/page.tsx')
  const signup = read('../app/(auth)/signup/page.tsx')
  const actions = read('../app/(auth)/actions.ts')
  const callback = read('../app/auth/callback/route.ts')
  assert.match(login, /value === '\/app'/)
  assert.match(signup, /value === '\/app'/)
  assert.match(signup, /name="next" value=\{next\}/)
  assert.match(actions, /const onboardingPath = `\/app\/onboarding\?next=\$\{encodeURIComponent\(next\)\}`/)
  assert.match(actions, /msg\(`\/login\?next=\$\{encodeURIComponent\(next\)\}`/)
  assert.match(callback, /function signupErrorRedirect\(request: NextRequest, next: string, message: string\)/)
  assert.match(callback, /loginUrl\.searchParams\.set\('next', next\)/)
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
  assert.match(onboarding, /MORT staff review each submission/)
  assert.match(onboarding, /Do not email identity documents/)
})

test('only the DOB-saving onboarding action bypasses the initial DOB gate', () => {
  const actions = read('../app/app/actions.ts')
  assert.match(actions, /saveOnboardingAccount\(formData: FormData\)[\s\S]*?requireAuthenticatedUser\(\)/)
  assert.match(actions, /saveOnboardingWork\(formData: FormData\)[\s\S]*?requireUser\(\)/)
  assert.match(actions, /saveOnboardingSafety\(formData: FormData\)[\s\S]*?requireUser\(\)/)
  assert.match(actions, /completeOnboarding\(formData: FormData\)[\s\S]*?requireUser\(\)/)
})

test('protected app routes preserve an in-app destination through the auth gate', () => {
  const proxy = read('../proxy.ts')
  const sessionProxy = read('../lib/supabase/proxy.ts')
  const auth = read('../lib/auth.ts')
  const login = read('../app/(auth)/login/page.tsx')
  const signup = read('../app/(auth)/signup/page.tsx')
  const shell = read('../components/auth-shell.tsx')
  assert.match(proxy, /const \{ pathname, search \} = request\.nextUrl[\s\S]*?updateSession\(request, appPath\)/)
  assert.match(sessionProxy, /x-mort-request-path/)
  assert.match(auth, /url\.pathname !== '\/app' && !url\.pathname\.startsWith\('\/app\/'\)/)
  assert.match(auth, /next: await requestedAppDestination\(\)/)
  assert.match(login, /Sign in to continue setting up your MORT account/)
  assert.match(login, /Your original onboarding destination is saved/)
  assert.match(signup, /Complete onboarding and account review before marketplace access opens/)
  assert.match(shell, /aria-current=\{index === journey\.currentStep \? 'step' : undefined\}/)
})

test('dashboard gate returns show a persistent active-step onboarding resume panel', () => {
  const onboarding = read('../app/app/onboarding/page.tsx')
  assert.match(onboarding, /sp\?\.message === 'Finish setting up your MORT account to continue\.'/)
  assert.match(onboarding, /progress\?\.active_step/)
  assert.match(onboarding, /<Toast message=\{isResumeNudge \? undefined : sp\?\.message\} \/>/)
  assert.match(onboarding, /className="onboarding-resume"/)
  assert.match(onboarding, /Step \{resumeStep\.number\} of 4/)
  assert.match(onboarding, /href="#onboarding-current-title"/)
  assert.match(onboarding, /marketplace access still follows account review/)
})
