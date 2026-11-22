import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { setTimeout as delay } from 'node:timers/promises'

// Run after `npm run build`. No account, hosted tokens, cookies, or provider
// calls: only the public page and malformed/absent callback inputs.
const host = '127.0.0.1'
const port = 3317
const origin = `http://${host}:${port}`
const pathname = '/account-deletion'
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', host, '-p', String(port)], {
  env: {
    ...process.env,
    VERCEL_ENV: 'preview',
    NEXT_PUBLIC_SITE_URL: origin,
    NEXT_PUBLIC_SUPABASE_URL: 'https://account-deletion-ci-placeholder.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_ci_build_placeholder',
  },
  stdio: 'inherit',
})
const exited = once(child, 'exit')
const request = (path) => fetch(new URL(path, origin), { redirect: 'manual', signal: AbortSignal.timeout(2500) })

try {
  let page
  const deadline = Date.now() + 20_000
  do {
    assert.equal(child.exitCode, null, 'Isolated Next.js server stopped before it was ready')
    try {
      page = await request(pathname)
    } catch {
      await delay(200)
    }
  } while (!page && Date.now() < deadline)
  assert.ok(page, 'Isolated Next.js server did not respond')
  assert.equal(page.status, 200)
  assert.match(page.headers.get('cache-control') ?? '', /\bno-store\b/)
  assert.equal(page.headers.get('referrer-policy'), 'no-referrer')
  const html = await page.text()
  assert.match(html, /Delete your MORT account/)
  assert.match(html, /Verify with password/)
  assert.match(html, /Send verification link/)
  assert.match(html, /Private receipt code/)
  assert.doesNotMatch(html, /Submit deletion request|Your MORT account was deleted/)
  console.log('PASS public deletion route: HTTP 200, no-store, no-referrer, verification and receipt UI')

  for (const query of ['', `?code=${'z'.repeat(257)}&next=https%3A%2F%2Fexample.invalid`]) {
    const response = await request(`${pathname}/confirm${query}`)
    assert.equal(response.status, 303)
    assert.equal(response.headers.get('location'), `${origin}${pathname}?result=link_invalid`)
    assert.match(response.headers.get('cache-control') ?? '', /\bno-store\b/)
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
    assert.equal(response.headers.has('set-cookie'), false)
  }
  console.log('PASS callback: absent and oversized codes rejected without session, forwarding, or disclosure')

  const forged = await request(`${pathname}?result=verified`)
  assert.equal(forged.status, 200)
  assert.doesNotMatch(await forged.text(), /Identity verified\.|Submit deletion request/)
  console.log('PASS anonymous result query cannot make the page display a verified identity')
} finally {
  child.kill()
  await exited
}
