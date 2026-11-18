import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('production CSP uses only the intended MORT Supabase project', async () => {
  const cspOrigin = await import('../lib/supabase/csp-origin.mjs').catch(() => ({}))
  assert.equal(typeof cspOrigin.getSupabaseOrigin, 'function')
  assert.equal(
    cspOrigin.getSupabaseOrigin('https://jxbnrkasktbhtiujkhay.supabase.co', 'production'),
    'https://jxbnrkasktbhtiujkhay.supabase.co',
  )
  assert.throws(
    () => cspOrigin.getSupabaseOrigin('https://rakjydmgwwgtdislanbt.supabase.co', 'production'),
    /production Supabase origin/i,
  )
})

test('preview CSP accepts only a valid HTTPS Supabase project origin', async () => {
  const cspOrigin = await import('../lib/supabase/csp-origin.mjs').catch(() => ({}))
  assert.equal(typeof cspOrigin.getSupabaseOrigin, 'function')
  assert.equal(
    cspOrigin.getSupabaseOrigin('https://preview-project.supabase.co', 'preview'),
    'https://preview-project.supabase.co',
  )
  assert.throws(
    () => cspOrigin.getSupabaseOrigin('https://example.com', 'preview'),
    /HTTPS Supabase project URL/i,
  )
})

test('Stripe.js Payment Element CSP allows only documented script, API, and 3DS frame origins', () => {
  const config = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8')
  assert.match(config, /script-src[^\n]*https:\/\/\*\.js\.stripe\.com[^\n]*https:\/\/js\.stripe\.com/)
  assert.match(config, /STRIPE_API_ORIGIN = 'https:\/\/api\.stripe\.com'/)
  assert.match(config, /connect-src[^\n]*\$\{STRIPE_API_ORIGIN\}/)
  assert.match(config, /frame-src[^\n]*https:\/\/hooks\.stripe\.com/)
  assert.match(config, /frame-src[^\n]*https:\/\/\*\.js\.stripe\.com/)
  assert.doesNotMatch(config, /https:\/\/checkout\.stripe\.com|https:\/\/link\.com|https:\/\/\*\.link\.com/)
})
