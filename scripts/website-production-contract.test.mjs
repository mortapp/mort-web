import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Guardian dashboard is scoped to active mutually-consented links', async () => {
  const source = await read('app/app/guardian/page.tsx')
  assert.match(source, /eq\('status', 'active'\)/)
  assert.match(source, /teen_consent_at && link\.guardian_consent_at/)
  assert.match(source, /rpc\('get_my_job_applications'/)
  assert.doesNotMatch(source, /\.from\('profiles'\)/)
  assert.match(source, /\.from\('safety_pings'\)/)
})

test('Teen job discovery and direct details respect the production release gate', async () => {
  const list = await read('app/app/teen/jobs/page.tsx')
  const detail = await read('app/app/teen/jobs/[id]/page.tsx')
  assert.match(list, /rpc\('list_open_jobs_page'/)
  assert.doesNotMatch(list, /\.from\('jobs'\)/)
  assert.match(detail, /rpc\('get_runtime_feature_status'/)
  assert.match(detail, /public_marketplace_closed !== false/)
})

test('Teen application availability is an explicit scheduled-job confirmation', async () => {
  const action = await read('app/app/teen/actions.ts')
  const page = await read('app/app/teen/jobs/[id]/page.tsx')
  assert.match(action, /p_availability_confirmed: v\(formData, 'availability_confirmed'\) === 'on'/)
  assert.match(page, /name="availability_confirmed" required/)
})

test('Profile and safety-report actions do not call unsupported legacy profile RPCs', async () => {
  const source = await read('app/app/actions.ts')
  assert.doesNotMatch(source, /rpc\('update_my_profile'/)
  assert.match(source, /p_target_user_id: val\(formData, 'target_user_id'\) \|\| null/)
  assert.match(source, /p_target_job_id: val\(formData, 'target_job_id'\) \|\| null/)
  assert.match(source, /p_target_message_id: val\(formData, 'target_message_id'\) \|\| null/)
})

test('Adult job management is adult-only and uses supported lifecycle actions', async () => {
  const source = await read('app/app/adult/actions.ts')
  assert.equal((source.match(/requireRole\(\['adult'\]\)/g) || []).length, 3)
  assert.doesNotMatch(source, /close_applications/)
  assert.match(source, /save_job_draft_or_publish/)
  assert.match(source, /update_my_job_application_status/)
  assert.match(source, /manage_job_v2/)
  assert.doesNotMatch(source, /exact_address/)
})

test('Safety page uses the production safety-ping contract and minimal history fields', async () => {
  const page = await read('app/app/safety/page.tsx')
  const action = await read('app/app/teen/actions.ts')
  assert.match(page, /select\('id, status, note, immediate_danger, created_at'\)/)
  assert.match(action, /rpc\('create_safety_ping_v2'/)
  for (const arg of ['p_status', 'p_note', 'p_job_id', 'p_immediate_danger', 'p_client_request_id']) {
    assert.match(action, new RegExp(arg))
  }
})

test('Guardian application actions remain read-only and messaging uses scoped RPCs', async () => {
  const guardian = await read('app/app/guardian/actions.ts')
  const messages = await read('app/app/messages/actions.ts')
  assert.doesNotMatch(guardian, /supabase\.rpc\(|supabase\.from\(/)
  assert.match(messages, /rpc\('send_safe_message_v2'/)
})

test('Website uses the shared MORT monochrome system with light mode primary', async () => {
  const root = await read('app/layout.tsx')
  const theme = await read('app/mort-2-theme.css')
  const shell = await read('components/app-shell.tsx')
  assert.match(root, /data-theme="light"/)
  assert.match(theme, /:root, :root\[data-theme="light"\]/)
  assert.match(theme, /:root\[data-theme="dark"\]/)
  assert.match(shell, /app-mobile-nav/)
  assert.match(shell, /consumerNav/)
  assert.match(shell, /role === 'teen'/)
  assert.match(shell, /role === 'adult'/)
  assert.match(shell, /guardian:/)
  assert.match(shell, /role === 'admin'/)
})

test('Onboarding saves canonical production job categories', async () => {
  const source = await read('components/onboarding-form.tsx')
  for (const category of ['yard_work', 'pet_care', 'tutoring', 'household_help', 'moving_help', 'tech_help', 'other']) {
    assert.match(source, new RegExp(category))
  }
  assert.doesNotMatch(source, /category\.toLowerCase\(\)/)
})

test('Adult publishing and assignment acceptance fail closed on missing production safeguards', async () => {
  const capabilities = await read('lib/production-capabilities.ts')
  const action = await read('app/app/adult/actions.ts')
  const home = await read('app/app/adult/page.tsx')
  const post = await read('app/app/adult/post-job/page.tsx')
  const applications = await read('app/app/adult/applications/page.tsx')
  assert.match(capabilities, /perTaskGuardianApproval: false/)
  assert.match(action, /runtime\?\.payments_disabled !== false/)
  assert.match(action, /!productionCapabilities\.perTaskGuardianApproval/)
  assert.match(action, /payment_method: 'stripe'/)
  assert.match(action, /locationText.length > 80/)
  assert.match(action, /toIndianapolisIso/)
  assert.match(home, /productionCapabilities\.perTaskGuardianApproval/)
  assert.match(post, /productionCapabilities\.perTaskGuardianApproval/)
  assert.doesNotMatch(post, /name="requires_guardian_approval"/)
  assert.doesNotMatch(post, /pay_label/)
  assert.match(post, /do not request cash/)
  assert.match(applications, /productionCapabilities\.perTaskGuardianApproval/)
})

test('Google signup keeps date of birth out of the OAuth URL', async () => {
  const actions = await read('app/(auth)/actions.ts')
  const callback = await read('app/auth/callback/route.ts')
  assert.match(actions, /cookieStore\.set\('mort_signup_dob'/)
  assert.match(actions, /httpOnly: true/)
  assert.match(actions, /maxAge: 600/)
  assert.doesNotMatch(actions, /searchParams\.set\('signup_dob'/)
  assert.match(callback, /request\.cookies\.get\('mort_signup_dob'/)
  assert.match(callback, /maxAge: 0/)
  assert.doesNotMatch(callback, /searchParams\.get\('signup_dob'/)
})

test('Support tickets and profile editing fail closed without production RPCs', async () => {
  const support = await read('app/app/support/page.tsx')
  const supportActions = await read('app/app/support/actions.ts')
  const profile = await read('app/app/profile/page.tsx')
  assert.match(support, /Ticket support is not available yet/)
  assert.doesNotMatch(support, /from\('support_tickets'\)/)
  assert.doesNotMatch(supportActions, /rpc\(/)
  assert.match(profile, /Profile editing is temporarily unavailable/)
  assert.doesNotMatch(profile, /BadgeRow|saveProfile/)
})

test('Teen applications can be withdrawn through the supported production RPC', async () => {
  const action = await read('app/app/teen/actions.ts')
  const page = await read('app/app/teen/applications/page.tsx')
  assert.match(action, /export async function withdrawApplication/)
  assert.match(action, /p_action: 'withdrawn'/)
  assert.match(page, /Withdraw application/)
})

test('Public safety copy does not claim unavailable verification or Guardian approvals', async () => {
  const page = await read('app/safety/page.tsx')
  assert.match(page, /identity-verification provider is not configured/)
  assert.match(page, /does not yet provide a verified per-Task Guardian approval workflow/)
  assert.match(page, /does not contact emergency services/)
  assert.match(page, /payment processing/)
  assert.match(page, /payouts/)
})

test('Messaging is role-scoped and discloses missing block controls', async () => {
  const inbox = await read('app/app/messages/page.tsx')
  const thread = await read('app/app/messages/[id]/page.tsx')
  const actions = await read('app/app/messages/actions.ts')
  assert.match(inbox, /requireRole/)
  assert.match(thread, /requireRole/)
  assert.match(actions, /send_safe_message_v2/)
  assert.match(thread, /Blocking is not available in the current production backend/)
  assert.doesNotMatch(actions, /user_blocks/)
})

test('Payments UI does not offer off-platform payment preferences', async () => {
  const page = await read('app/app/payments/page.tsx')
  const history = await read('app/app/teen/earnings/page.tsx')
  assert.match(page, /Payment processing is disabled/)
  assert.doesNotMatch(page, /Square URL/)
  assert.match(page, /Do not arrange cash, Cash App/)
  assert.doesNotMatch(history, /pay_label/)
})
