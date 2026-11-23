import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const port = '48139'
const base = 'http://127.0.0.1:' + port
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', port], {
  stdio: 'inherit',
})

try {
  let ready = false
  for (let attempt = 0; attempt < 40 && server.exitCode === null; attempt++) {
    try {
      const result = await fetch(base + '/account-deletion', { signal: AbortSignal.timeout(2_000) })
      ready = result.ok
      if (ready) break
    } catch {
      // The local production server is still starting.
    }
    await delay(250)
  }
  assert.ok(ready, 'Production build should serve the public deletion page without authentication')

  const deletion = await fetch(base + '/account-deletion', { redirect: 'manual' })
  assert.equal(deletion.status, 200)
  const page = await deletion.text()
  assert.match(page, /<h1[^>]*>Delete your MORT account<\/h1>/)
  assert.match(page, /href="mailto:privacy@mortapp\.org\?subject=MORT%20account%20deletion%20request"/)
  assert.doesNotMatch(page, /mortapp\.help@gmail\.com/)
  assert.match(page, /href="\/legal\/privacy"/)
  assert.doesNotMatch(page, /<form\b|<input\b/)

  const home = await fetch(base)
  assert.equal(home.status, 200)
  assert.match(await home.text(), /<a[^>]+href="\/account-deletion"[^>]*>Delete account<\/a>/)

  for (const path of ['/login', '/signup', '/safety', '/legal/privacy']) {
    assert.equal((await fetch(base + path, { redirect: 'manual' })).status, 200, path + ' must still load')
  }
  const guarded = await fetch(base + '/app', { redirect: 'manual' })
  assert.ok([302, 303, 307, 308].includes(guarded.status), 'Workspace should redirect signed-out requests')
  assert.equal(new URL(guarded.headers.get('location'), base).pathname, '/login')
  console.log('Public deletion and existing navigation smoke checks passed.')
} finally {
  server.kill()
}
