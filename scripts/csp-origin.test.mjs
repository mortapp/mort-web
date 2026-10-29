import assert from 'node:assert/strict'
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
