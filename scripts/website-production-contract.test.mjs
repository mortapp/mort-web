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
